# =============================================================
#  Universe Reborn — Admin Blueprint
#  Toutes les opérations sur la BDD DarkflameServer
# =============================================================
import re
import random
import string
import time
from datetime import datetime
from functools import wraps
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import NewsArticle, BugReport, ZONE_NAMES, ZONE_COLORS

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated


def _conn():
    return db.engine.connect()


def _gen_key():
    seg = lambda: ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'{seg()}-{seg()}-{seg()}-{seg()}'


# ---- DASHBOARD ----
@admin_bp.route('/')
@admin_required
def index():
    with _conn() as conn:
        total_accounts = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
        active_accounts = conn.execute(db.text("SELECT COUNT(*) FROM accounts WHERE banned=0 AND locked=0")).fetchone()[0]
        banned_accounts = conn.execute(db.text("SELECT COUNT(*) FROM accounts WHERE banned=1")).fetchone()[0]
        total_chars = conn.execute(db.text("SELECT COUNT(*) FROM charinfo")).fetchone()[0]
        active_keys = conn.execute(db.text("SELECT COUNT(*) FROM play_keys WHERE active=1 AND key_uses>0")).fetchone()[0]
        total_keys = conn.execute(db.text("SELECT COUNT(*) FROM play_keys")).fetchone()[0]
        # Tentative récupération activity_log (peut ne pas exister)
        try:
            sessions_today = conn.execute(db.text(
                "SELECT COUNT(*) FROM activity_log WHERE activity=0 AND time > :t"),
                {'t': int(time.time()) - 86400}
            ).fetchone()[0]
        except Exception:
            sessions_today = 0
    stats = {
        'total_accounts': total_accounts,
        'active_accounts': active_accounts,
        'banned_accounts': banned_accounts,
        'total_chars': total_chars,
        'active_keys': active_keys,
        'total_keys': total_keys,
        'sessions_today': sessions_today,
        'total_news': NewsArticle.query.count(),
        'open_bugs': BugReport.query.filter_by(status='open').count(),
    }
    return render_template('panel/admin/index.html', stats=stats)


# ---- ACTIVITY DATA (Chart.js) ----
@admin_bp.route('/activity-data')
@admin_required
def activity_data():
    """Retourne les données d'activité des 7 derniers jours pour Chart.js."""
    epoch = int(time.time())
    last_week = epoch - 7 * 86400
    labels = []
    sessions_data = []
    playtime_data = []
    zone_data = {}

    for i in range(6, -1, -1):
        day_start = epoch - (i + 1) * 86400
        day_end   = epoch - i * 86400
        labels.append(datetime.fromtimestamp(day_end).strftime('%d/%m'))

        try:
            with _conn() as conn:
                # Sessions (logins) du jour
                sessions = conn.execute(db.text(
                    "SELECT COUNT(*) FROM activity_log WHERE activity=0 AND time>=:s AND time<:e"
                ), {'s': day_start, 'e': day_end}).fetchone()[0]
                sessions_data.append(sessions)

                # Temps de jeu du jour (login-logout pairs)
                logins  = conn.execute(db.text(
                    "SELECT character_id, time FROM activity_log WHERE activity=0 AND time>=:s AND time<:e"
                ), {'s': day_start, 'e': day_end}).fetchall()
                logouts = conn.execute(db.text(
                    "SELECT character_id, time FROM activity_log WHERE activity=1 AND time>=:s AND time<:e"
                ), {'s': day_start, 'e': day_end}).fetchall()
                logout_map = {r[0]: r[1] for r in logouts}
                total_secs = sum(
                    (logout_map[r[0]] - r[1]) for r in logins
                    if r[0] in logout_map and logout_map[r[0]] > r[1]
                )
                playtime_data.append(round(total_secs / 3600, 2))

                # Temps par zone
                zones = conn.execute(db.text(
                    "SELECT map_id, SUM(CASE WHEN al2.time IS NULL THEN 0 ELSE al2.time - al1.time END) "
                    "FROM activity_log al1 "
                    "LEFT JOIN activity_log al2 ON al1.character_id=al2.character_id AND al2.activity=1 "
                    "WHERE al1.activity=0 AND al1.time>=:s AND al1.time<:e AND al1.map_id%100=0 "
                    "GROUP BY al1.map_id"
                ), {'s': day_start, 'e': day_end}).fetchall()
                for z_id, z_time in zones:
                    if z_id not in zone_data:
                        zone_data[z_id] = [0] * 7
                    idx = 6 - i
                    zone_data[z_id][idx] = round((z_time or 0) / 3600, 2)
        except Exception:
            sessions_data.append(0)
            playtime_data.append(0)

    zone_datasets = [
        {
            'label': ZONE_NAMES.get(z, f'Zone {z}'),
            'data': data,
            'borderColor': ZONE_COLORS.get(z, 'rgba(200,200,200,1)'),
            'backgroundColor': ZONE_COLORS.get(z, 'rgba(200,200,200,0.1)').replace(',1)', ',0.1)'),
            'borderWidth': 2, 'tension': 0.4, 'fill': False
        }
        for z, data in zone_data.items()
    ]

    return jsonify({
        'labels': labels,
        'sessions': sessions_data,
        'playtime': playtime_data,
        'zones': zone_datasets
    })


# ---- JOUEURS ----
@admin_bp.route('/players')
@admin_required
def players():
    q = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = 25
    with _conn() as conn:
        if q:
            rows = conn.execute(db.text(
                "SELECT id, name, gm_level, banned, locked, play_key_id "
                "FROM accounts WHERE name LIKE :q ORDER BY id DESC LIMIT :lim OFFSET :off"
            ), {'q': f'%{q}%', 'lim': per_page, 'off': (page-1)*per_page}).fetchall()
            total = conn.execute(db.text(
                "SELECT COUNT(*) FROM accounts WHERE name LIKE :q"), {'q': f'%{q}%'}).fetchone()[0]
        else:
            rows = conn.execute(db.text(
                "SELECT id, name, gm_level, banned, locked, play_key_id "
                "FROM accounts ORDER BY id DESC LIMIT :lim OFFSET :off"
            ), {'lim': per_page, 'off': (page-1)*per_page}).fetchall()
            total = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
    users = [{'id': r[0], 'name': r[1], 'gm_level': r[2],
               'banned': r[3], 'locked': r[4], 'play_key_id': r[5]} for r in rows]
    return render_template('panel/admin/players.html',
                           users=users, q=q, page=page,
                           total=total, per_page=per_page)


@admin_bp.route('/players/<int:uid>/ban', methods=['POST'])
@admin_required
def ban_player(uid):
    reason = request.form.get('reason', 'Non précisée')
    with _conn() as conn:
        row = conn.execute(db.text("SELECT gm_level FROM accounts WHERE id=:id"), {'id': uid}).fetchone()
        if row and row[0] >= 9:
            flash('Impossible de bannir un GM9.', 'danger')
            return redirect(url_for('admin.players'))
        conn.execute(db.text("UPDATE accounts SET banned=1, ban_reason=:r WHERE id=:id"), {'r': reason, 'id': uid})
        conn.commit()
    flash('Joueur banni.', 'success')
    return redirect(url_for('admin.players'))


@admin_bp.route('/players/<int:uid>/unban', methods=['POST'])
@admin_required
def unban_player(uid):
    with _conn() as conn:
        conn.execute(db.text("UPDATE accounts SET banned=0, ban_reason=NULL WHERE id=:id"), {'id': uid})
        conn.commit()
    flash('Joueur débanni.', 'success')
    return redirect(url_for('admin.players'))


@admin_bp.route('/players/<int:uid>/setgm', methods=['POST'])
@admin_required
def set_gm(uid):
    level = request.form.get('level', 0, type=int)
    if level < 0 or level > 9:
        abort(400)
    with _conn() as conn:
        conn.execute(db.text("UPDATE accounts SET gm_level=:l WHERE id=:id"), {'l': level, 'id': uid})
        conn.commit()
    flash(f'Niveau GM mis à jour.', 'success')
    return redirect(url_for('admin.players'))


# ---- PERSONNAGES ----
@admin_bp.route('/characters')
@admin_required
def characters():
    q = request.args.get('q', '').strip()
    with _conn() as conn:
        if q:
            rows = conn.execute(db.text(
                "SELECT c.id, c.name, c.account_id, c.last_zone, c.last_login, a.name "
                "FROM charinfo c JOIN accounts a ON c.account_id=a.id "
                "WHERE c.name LIKE :q ORDER BY c.last_login DESC LIMIT 50"
            ), {'q': f'%{q}%'}).fetchall()
        else:
            rows = conn.execute(db.text(
                "SELECT c.id, c.name, c.account_id, c.last_zone, c.last_login, a.name "
                "FROM charinfo c JOIN accounts a ON c.account_id=a.id "
                "ORDER BY c.last_login DESC LIMIT 50"
            )).fetchall()
    chars = [{
        'id': r[0], 'name': r[1], 'account_id': r[2],
        'zone': ZONE_NAMES.get(r[3], f'Zone {r[3]}'),
        'last_login': r[4], 'account_name': r[5]
    } for r in rows]
    return render_template('panel/admin/characters.html', characters=chars, q=q)


# ---- PLAY KEYS ----
@admin_bp.route('/play-keys')
@admin_required
def play_keys():
    with _conn() as conn:
        rows = conn.execute(db.text(
            "SELECT id, key_string, key_uses, active, notes FROM play_keys ORDER BY id DESC"
        )).fetchall()
    keys = [{'id': r[0], 'key_string': r[1], 'key_uses': r[2],
              'active': r[3], 'notes': r[4]} for r in rows]
    return render_template('panel/admin/play_keys.html', keys=keys)


@admin_bp.route('/play-keys/generate', methods=['POST'])
@admin_required
def generate_play_key():
    count = min(request.form.get('count', 1, type=int), 50)
    uses  = request.form.get('uses', 1, type=int)
    notes = request.form.get('notes', '')
    generated = []
    with _conn() as conn:
        for _ in range(count):
            k = _gen_key()
            conn.execute(db.text(
                "INSERT INTO play_keys (key_string, key_uses, active, notes) VALUES (:k, :u, 1, :n)"
            ), {'k': k, 'u': uses, 'n': notes})
            generated.append(k)
        conn.commit()
    flash(f'{len(generated)} clé(s) générée(s).', 'success')
    return redirect(url_for('admin.play_keys'))


@admin_bp.route('/play-keys/<int:kid>/delete', methods=['POST'])
@admin_required
def delete_key(kid):
    with _conn() as conn:
        conn.execute(db.text("DELETE FROM play_keys WHERE id=:id"), {'id': kid})
        conn.commit()
    flash('Clé supprimée.', 'success')
    return redirect(url_for('admin.play_keys'))


# ---- NEWS ----
@admin_bp.route('/news')
@admin_required
def news_list():
    articles = NewsArticle.query.order_by(NewsArticle.created_at.desc()).all()
    return render_template('panel/admin/news.html', articles=articles)


@admin_bp.route('/news/create', methods=['GET', 'POST'])
@admin_required
def news_create():
    error = None
    if request.method == 'POST':
        title   = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        excerpt = request.form.get('excerpt', '').strip() or None
        category = request.form.get('category', 'Actualité')
        publish = 'publish' in request.form
        if not title or not content:
            error = 'Titre et contenu obligatoires.'
        else:
            slug = re.sub(r'[^a-z0-9-]', '', re.sub(r'\s+', '-', title.lower()))
            base, i = slug, 1
            while NewsArticle.query.filter_by(slug=slug).first():
                slug = f'{base}-{i}'; i += 1
            a = NewsArticle(title=title, slug=slug, content=content,
                            excerpt=excerpt, category=category,
                            author_name=current_user.username,
                            is_published=publish,
                            published_at=datetime.utcnow() if publish else None)
            db.session.add(a)
            db.session.commit()
            flash('Article publié.', 'success')
            return redirect(url_for('admin.news_list'))
    return render_template('panel/admin/news_form.html', article=None, error=error)


@admin_bp.route('/news/<int:aid>/edit', methods=['GET', 'POST'])
@admin_required
def news_edit(aid):
    article = NewsArticle.query.get_or_404(aid)
    error = None
    if request.method == 'POST':
        article.title   = request.form.get('title', article.title).strip()
        article.content = request.form.get('content', article.content).strip()
        article.excerpt = request.form.get('excerpt', '').strip() or None
        article.category = request.form.get('category', article.category)
        publish = 'publish' in request.form
        if publish and not article.is_published:
            article.published_at = datetime.utcnow()
        article.is_published = publish
        db.session.commit()
        flash('Article mis à jour.', 'success')
        return redirect(url_for('admin.news_list'))
    return render_template('panel/admin/news_form.html', article=article, error=error)


@admin_bp.route('/news/<int:aid>/delete', methods=['POST'])
@admin_required
def news_delete(aid):
    a = NewsArticle.query.get_or_404(aid)
    db.session.delete(a)
    db.session.commit()
    flash('Article supprimé.', 'success')
    return redirect(url_for('admin.news_list'))


# ---- BUG REPORTS ----
@admin_bp.route('/bugs')
@admin_required
def bugs():
    status = request.args.get('status', 'open')
    reports = BugReport.query.filter_by(status=status).order_by(BugReport.created_at.desc()).all()
    return render_template('panel/admin/bug_reports.html', reports=reports, status=status)


@admin_bp.route('/bugs/<int:rid>/status', methods=['POST'])
@admin_required
def bug_status(rid):
    r = BugReport.query.get_or_404(rid)
    s = request.form.get('status', 'open')
    if s in ('open', 'in_progress', 'closed'):
        r.status = s
        db.session.commit()
    return redirect(url_for('admin.bugs'))
