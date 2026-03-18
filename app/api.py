from flask import Blueprint, jsonify
from app.models import User, Character
from app import db
import socket
import os

api_bp = Blueprint('api', __name__)


def check_port(host, port, timeout=2):
    """Vérifie si un port TCP est ouvert."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False


@api_bp.route('/status')
def server_status():
    """Retourne le statut du serveur DarkflameServer."""
    dfs_host = os.environ.get('DFS_HOST', 'localhost')
    dfs_port = int(os.environ.get('DFS_AUTH_PORT', 1001))

    is_online = check_port(dfs_host, dfs_port)

    total_users = User.query.filter_by(is_active=True).count()
    total_characters = Character.query.filter_by(is_active=True).count()

    return jsonify({
        'online': is_online,
        'players_online': 0,  # À connecter à DarkflameServer via sa propre API/DB
        'total_users': total_users,
        'total_characters': total_characters,
        'server': 'Universe Reborn'
    })


@api_bp.route('/leaderboard')
def leaderboard():
    """Retourne le classement des joueurs."""
    top = Character.query.filter_by(is_active=True)\
        .order_by(Character.level.desc(), Character.universe_score.desc())\
        .limit(10).all()
    return jsonify([{
        'name': c.name,
        'level': c.level,
        'universe_score': c.universe_score,
        'zone': c.current_zone
    } for c in top])
