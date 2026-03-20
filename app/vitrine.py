import time
from flask import Blueprint, render_template
from app import db
from app.models import NewsArticle, ZONE_NAMES

vitrine_bp = Blueprint('vitrine', __name__)


@vitrine_bp.route('/')
def index():
    articles = NewsArticle.query.filter_by(is_published=True)\
        .order_by(NewsArticle.published_at.desc()).limit(3).all()
    try:
        with db.engine.connect() as conn:
            total_users = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
            total_characters = conn.execute(db.text("SELECT COUNT(*) FROM charinfo")).fetchone()[0]
    except Exception:
        total_users = 0
        total_characters = 0
    return render_template(
        'vitrine/index.html',
        articles=articles,
        latest_news=articles,
        total_users=total_users,
        total_characters=total_characters
    )


@vitrine_bp.route('/about')
def about():
    return render_template('vitrine/about.html')


@vitrine_bp.route('/guide')
def guide():
    return render_template('vitrine/guide.html')


@vitrine_bp.route('/gallery')
def gallery():
    return render_template('vitrine/gallery.html')


@vitrine_bp.route('/leaderboard')
def leaderboard():
    try:
        with db.engine.connect() as conn:
            # Tentative de récupération avec level et universe_score si colonnes existent
            try:
                rows = conn.execute(db.text(
                    "SELECT c.name, c.last_zone, c.last_login, "
                    "COALESCE(c.level, 0) as level, "
                    "COALESCE(c.universe_score, 0) as universe_score "
                    "FROM charinfo c ORDER BY universe_score DESC, last_login DESC LIMIT 25"
                )).fetchall()
                chars = [{
                    'name': r[0],
                    'zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}') if r[1] else 'Inconnu',
                    'last_login': r[2],
                    'level': r[3] or 0,
                    'universe_score': r[4] or 0,
                    'current_zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}') if r[1] else 'Inconnu'
                } for r in rows]
            except Exception:
                # Fallback si colonnes level/universe_score absentes
                rows = conn.execute(db.text(
                    "SELECT c.name, c.last_zone, c.last_login "
                    "FROM charinfo c ORDER BY c.last_login DESC LIMIT 25"
                )).fetchall()
                chars = [{
                    'name': r[0],
                    'zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}') if r[1] else 'Inconnu',
                    'last_login': r[2],
                    'level': 0,
                    'universe_score': 0,
                    'current_zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}') if r[1] else 'Inconnu'
                } for r in rows]
    except Exception:
        chars = []
    return render_template('vitrine/leaderboard.html', top_characters=chars)


@vitrine_bp.route('/legal')
def legal():
    return render_template('vitrine/legal.html')
