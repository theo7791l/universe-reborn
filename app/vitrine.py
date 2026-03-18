from flask import Blueprint, render_template
from app.models import User, Character, NewsArticle
from app import db

vitrine_bp = Blueprint('vitrine', __name__)


@vitrine_bp.route('/')
def index():
    total_users = User.query.filter_by(is_active=True).count()
    total_characters = Character.query.filter_by(is_active=True).count()
    latest_news = NewsArticle.query.filter_by(is_published=True)\
        .order_by(NewsArticle.published_at.desc()).limit(3).all()
    return render_template('vitrine/index.html',
                           total_users=total_users,
                           total_characters=total_characters,
                           latest_news=latest_news)


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
    top_characters = Character.query.filter_by(is_active=True)\
        .order_by(Character.level.desc(), Character.universe_score.desc())\
        .limit(20).all()
    return render_template('vitrine/leaderboard.html', top_characters=top_characters)


@vitrine_bp.route('/legal')
def legal():
    return render_template('vitrine/legal.html')
