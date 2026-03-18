from flask import Blueprint, jsonify
from app.models import DFCharacter, User, NewsArticle
from app import db

api_bp = Blueprint('api', __name__)


@api_bp.route('/status')
def server_status():
    """Statut public du serveur — appelé par le JS de la page d'accueil."""
    try:
        player_count = DFCharacter.query.count()
        db_ok = True
    except Exception:
        player_count = 0
        db_ok = False
    return jsonify({
        'online': db_ok,
        'player_count': player_count,
        'registered_accounts': User.query.count() if db_ok else 0,
        'version': '1.0.0'
    })


@api_bp.route('/leaderboard')
def leaderboard():
    """Top 10 personnages pour la page d'accueil."""
    try:
        chars = DFCharacter.query.order_by(DFCharacter.last_login.desc()).limit(10).all()
        data = [{
            'name': c.name,
            'zone': c.zone_name,
            'last_login': c.last_login.isoformat() if c.last_login else None
        } for c in chars]
    except Exception:
        data = []
    return jsonify(data)


@api_bp.route('/news')
def news():
    articles = NewsArticle.query.filter_by(is_published=True)\
        .order_by(NewsArticle.published_at.desc()).limit(5).all()
    return jsonify([{
        'id': a.id, 'title': a.title, 'slug': a.slug,
        'category': a.category, 'excerpt': a.excerpt,
        'published_at': a.published_at.isoformat() if a.published_at else None
    } for a in articles])
