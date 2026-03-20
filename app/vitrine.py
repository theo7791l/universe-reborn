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
            total_accounts = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
            total_chars    = conn.execute(db.text("SELECT COUNT(*) FROM charinfo")).fetchone()[0]
    except Exception:
        total_accounts = 0
        total_chars = 0
    return render_template('vitrine/index.html', articles=articles,
                           total_total_users=total_accounts, total_characters=total_chars)


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
            rows = conn.execute(db.text(
                "SELECT c.name, c.last_zone, c.last_login "
                "FROM charinfo c ORDER BY c.last_login DESC LIMIT 25"
            )).fetchall()
        chars = [{'name': r[0], 'zone': ZONE_NAMES.get(r[1], '?'), 'last_login': r[2]} for r in rows]
    except Exception:
        chars = []
    return render_template('vitrine/leaderboard.html', top_characters=chars)


@vitrine_bp.route('/legal')
def legal():
    return render_template('vitrine/legal.html')
