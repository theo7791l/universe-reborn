from flask import Blueprint, render_template
from app import db
from app.models import NewsArticle, ZONE_NAMES

vitrine_bp = Blueprint('vitrine', __name__)


def _scalar(sql, default=0):
    try:
        with db.engine.connect() as conn:
            row = conn.execute(db.text(sql)).fetchone()
        return row[0] if row else default
    except Exception:
        return default


@vitrine_bp.route('/')
def index():
    try:
        articles = NewsArticle.query.filter_by(is_published=True)\
            .order_by(NewsArticle.published_at.desc()).limit(3).all()
    except Exception:
        articles = []

    total_users      = _scalar("SELECT COUNT(*) FROM accounts")
    total_characters = _scalar("SELECT COUNT(*) FROM charinfo")

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
    chars = []
    try:
        with db.engine.connect() as conn:
            # Tentative avec level + universe_score
            try:
                rows = conn.execute(db.text(
                    "SELECT c.name, c.last_zone, c.last_login, "
                    "COALESCE(c.level, 0) as level, "
                    "COALESCE(c.universe_score, 0) as universe_score "
                    "FROM charinfo c ORDER BY universe_score DESC, last_login DESC LIMIT 25"
                )).fetchall()
                chars = [{
                    'name': r[0],
                    'current_zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}') if r[1] else 'Inconnu',
                    'last_login': r[2],
                    'level': r[3] or 0,
                    'universe_score': r[4] or 0
                } for r in rows]
            except Exception:
                # Fallback sans level/universe_score
                rows = conn.execute(db.text(
                    "SELECT c.name, c.last_zone, c.last_login "
                    "FROM charinfo c ORDER BY last_login DESC LIMIT 25"
                )).fetchall()
                chars = [{
                    'name': r[0],
                    'current_zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}') if r[1] else 'Inconnu',
                    'last_login': r[2],
                    'level': 0,
                    'universe_score': 0
                } for r in rows]
    except Exception:
        chars = []
    return render_template('vitrine/leaderboard.html', top_characters=chars)


@vitrine_bp.route('/legal')
def legal():
    return render_template('vitrine/legal.html')
