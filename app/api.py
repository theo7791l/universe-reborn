import time
from flask import Blueprint, jsonify
from app import db
from app.models import NewsArticle, ZONE_NAMES

api_bp = Blueprint('api', __name__)


@api_bp.route('/status')
def server_status():
    try:
        with db.engine.connect() as conn:
            total = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
            chars = conn.execute(db.text("SELECT COUNT(*) FROM charinfo")).fetchone()[0]
        return jsonify({'online': True, 'total_users': total, 'total_characters': chars, 'players_online': 0})    except Exception as e:
        return jsonify({'online': False, 'error': str(e), 'total_users': 0, 'total_characters': 0, 'players_online': 0})


@api_bp.route('/online-players')
def online_players():
    """Joueurs connectés = logins sans logout dans les 10 dernières minutes."""
    try:
        cutoff = int(time.time()) - 600
        with db.engine.connect() as conn:
            rows = conn.execute(db.text(
                "SELECT c.name, al.map_id FROM activity_log al "
                "JOIN charinfo c ON al.character_id=c.id "
                "WHERE al.activity=0 AND al.time > :t "
                "AND NOT EXISTS (SELECT 1 FROM activity_log al2 WHERE al2.character_id=al.character_id AND al2.activity=1 AND al2.time > al.time)"
            ), {'t': cutoff}).fetchall()
        return jsonify([{'name': r[0], 'zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}')} for r in rows])
    except Exception:
        return jsonify([])


@api_bp.route('/leaderboard')
def leaderboard():
    try:
        with db.engine.connect() as conn:
            rows = conn.execute(db.text(
                "SELECT c.name, c.last_zone, c.last_login FROM charinfo c ORDER BY c.last_login DESC LIMIT 10"
            )).fetchall()
        return jsonify([{'name': r[0], 'zone': ZONE_NAMES.get(r[1], '?'), 'last_login': str(r[2])} for r in rows])
    except Exception:
        return jsonify([])
