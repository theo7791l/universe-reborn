from flask import Blueprint, render_template
from app.models import NewsArticle, DFCharacter
from app import db

vitrine_bp = Blueprint('vitrine', __name__)


@vitrine_bp.route('/')
def index():
    articles = NewsArticle.query.filter_by(is_published=True)\
        .order_by(NewsArticle.published_at.desc()).limit(3).all()
    # Stats serveur depuis DarkflameServer
    try:
        total_chars = DFCharacter.query.count()
    except Exception:
        total_chars = 0
    return render_template('vitrine/index.html', articles=articles, total_chars=total_chars)


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
        # Lecture depuis DarkflameServer
        top_chars = DFCharacter.query\
            .order_by(DFCharacter.last_login.desc())\
            .limit(25).all()
    except Exception:
        top_chars = []
    return render_template('vitrine/leaderboard.html', top_characters=top_chars)


@vitrine_bp.route('/legal')
def legal():
    return render_template('vitrine/legal.html')
