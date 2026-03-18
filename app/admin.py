from functools import wraps
from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from app import db
from app.models import User, PlayKey, NewsArticle, BugReport, DFCharacter

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return login_required(decorated)


@admin_bp.route('/')
@admin_required
def index():
    try:
        total_chars = DFCharacter.query.count()
    except Exception:
        total_chars = 0
    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(is_banned=False).count(),
        'banned_users': User.query.filter_by(is_banned=True).count(),
        'total_characters': total_chars,
        'total_articles': NewsArticle.query.filter_by(is_published=True).count(),
        'open_bug_reports': BugReport.query.filter_by(status='open').count(),
        'total_play_keys': PlayKey.query.count(),
        'active_play_keys': PlayKey.query.filter_by(is_active=True).count(),
    }
    return render_template('panel/admin/index.html', stats=stats)


@admin_bp.route('/players')
@admin_required
def players():
    page = request.args.get('page', 1, type=int)
    q = request.args.get('q', '').strip()
    query = User.query
    if q:
        query = query.filter(
            User.username.ilike(f'%{q}%') | User.email.ilike(f'%{q}%')
        )
    users = query.order_by(User.created_at.desc()).paginate(page=page, per_page=25)
    return render_template('panel/admin/players.html', users=users, q=q)


@admin_bp.route('/players/<int:user_id>/ban', methods=['POST'])
@admin_required
def ban_player(user_id):
    user = User.query.get_or_404(user_id)
    if user.is_admin:
        flash('Impossible de bannir un administrateur.', 'danger')
        return redirect(url_for('admin.players'))
    reason = request.form.get('reason', 'Non précisée')
    user.is_banned = True
    user.ban_reason = reason
    db.session.commit()
    flash(f'{user.username} a été banni.', 'success')
    return redirect(url_for('admin.players'))


@admin_bp.route('/players/<int:user_id>/unban', methods=['POST'])
@admin_required
def unban_player(user_id):
    user = User.query.get_or_404(user_id)
    user.is_banned = False
    user.ban_reason = None
    db.session.commit()
    flash(f'{user.username} a été débanni.', 'success')
    return redirect(url_for('admin.players'))


@admin_bp.route('/players/<int:user_id>/promote', methods=['POST'])
@admin_required
def promote_player(user_id):
    user = User.query.get_or_404(user_id)
    user.is_admin = True
    db.session.commit()
    flash(f'{user.username} est maintenant administrateur.', 'success')
    return redirect(url_for('admin.players'))


@admin_bp.route('/play-keys')
@admin_required
def play_keys():
    keys = PlayKey.query.order_by(PlayKey.created_at.desc()).all()
    return render_template('panel/admin/play_keys.html', keys=keys)


@admin_bp.route('/play-keys/generate', methods=['POST'])
@admin_required
def generate_play_key():
    count = request.form.get('count', 1, type=int)
    uses = request.form.get('uses', 1, type=int)
    notes = request.form.get('notes', '')
    generated = []
    for _ in range(min(count, 50)):
        key_str = PlayKey.generate()
        key = PlayKey(
            key_string=key_str,
            uses_total=uses,
            uses_remaining=uses,
            notes=notes,
            created_by_id=current_user.id
        )
        db.session.add(key)
        generated.append(key_str)
    db.session.commit()
    flash(f'{len(generated)} clé(s) générée(s) avec succès.', 'success')
    return redirect(url_for('admin.play_keys'))


@admin_bp.route('/play-keys/<int:key_id>/delete', methods=['POST'])
@admin_required
def delete_play_key(key_id):
    key = PlayKey.query.get_or_404(key_id)
    db.session.delete(key)
    db.session.commit()
    flash('Clé supprimée.', 'success')
    return redirect(url_for('admin.play_keys'))


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
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()
        excerpt = request.form.get('excerpt', '').strip()
        category = request.form.get('category', 'Actualité')
        publish = request.form.get('publish') == 'on'
        if not title or not content:
            error = 'Titre et contenu sont obligatoires.'
        else:
            import re
            slug = re.sub(r'[^a-z0-9-]', '', re.sub(r'\s+', '-', title.lower().strip()))
            # Unicité slug
            base_slug = slug
            counter = 1
            while NewsArticle.query.filter_by(slug=slug).first():
                slug = f'{base_slug}-{counter}'
                counter += 1
            article = NewsArticle(
                title=title, slug=slug, content=content,
                excerpt=excerpt or None, category=category,
                author_id=current_user.id, is_published=publish,
                published_at=datetime.utcnow() if publish else None
            )
            db.session.add(article)
            db.session.commit()
            flash('Article publié avec succès.', 'success')
            return redirect(url_for('admin.news_list'))
    return render_template('panel/admin/news_form.html', article=None, error=error)


@admin_bp.route('/news/<int:article_id>/edit', methods=['GET', 'POST'])
@admin_required
def news_edit(article_id):
    article = NewsArticle.query.get_or_404(article_id)
    error = None
    if request.method == 'POST':
        article.title = request.form.get('title', article.title).strip()
        article.content = request.form.get('content', article.content).strip()
        article.excerpt = request.form.get('excerpt', '').strip() or None
        article.category = request.form.get('category', article.category)
        publish = request.form.get('publish') == 'on'
        if publish and not article.is_published:
            article.published_at = datetime.utcnow()
        article.is_published = publish
        db.session.commit()
        flash('Article mis à jour.', 'success')
        return redirect(url_for('admin.news_list'))
    return render_template('panel/admin/news_form.html', article=article, error=error)


@admin_bp.route('/news/<int:article_id>/delete', methods=['POST'])
@admin_required
def news_delete(article_id):
    article = NewsArticle.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    flash('Article supprimé.', 'success')
    return redirect(url_for('admin.news_list'))


@admin_bp.route('/bug-reports')
@admin_required
def bug_reports():
    status = request.args.get('status', 'open')
    reports = BugReport.query.filter_by(status=status)\
        .order_by(BugReport.created_at.desc()).all()
    return render_template('panel/admin/bug_reports.html', reports=reports, status=status)


@admin_bp.route('/bug-reports/<int:report_id>/status', methods=['POST'])
@admin_required
def update_bug_status(report_id):
    report = BugReport.query.get_or_404(report_id)
    new_status = request.form.get('status', 'open')
    if new_status in ('open', 'in_progress', 'closed'):
        report.status = new_status
        db.session.commit()
        flash('Statut mis à jour.', 'success')
    return redirect(url_for('admin.bug_reports'))
