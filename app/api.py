import time
from flask import Blueprint, jsonify
from app import db
from app.models import ZONE_NAMES

api_bp = Blueprint('api', __name__)


def _safe_query(sql, params=None):
    """Exécute une requête SQL brute de façon sécurisée (SQLAlchemy 2.x)."""
    try:
        with db.engine.connect() as conn:
            result = conn.execute(db.text(sql), params or {}).fetchall()
        return result
    except Exception:
        return []


def _safe_scalar(sql, params=None, default=0):
    try:
        with db.engine.connect() as conn:
            row = conn.execute(db.text(sql), params or {}).fetchone()
        return row[0] if row else default
    except Exception:
        return default


@api_bp.route('/status')
def server_status():
    try:
        total = _safe_scalar("SELECT COUNT(*) FROM accounts")
        chars = _safe_scalar("SELECT COUNT(*) FROM charinfo")
        # Joueurs en ligne = logins récents sans logout
        cutoff = int(time.time()) - 600
        players_online = _safe_scalar(
            "SELECT COUNT(*) FROM activity_log al "
            "WHERE al.activity=0 AND al.time > :t "
            "AND NOT EXISTS ("
            "  SELECT 1 FROM activity_log al2 "
            "  WHERE al2.character_id=al.character_id "
            "  AND al2.activity=1 AND al2.time > al.time"
            ")",
            {'t': cutoff}
        )
        return jsonify({
            'online': True,
            'accounts': total,
            'characters': chars,
            'players_online': int(players_online)
        })
    except Exception as e:
        return jsonify({'online': False, 'error': str(e), 'players_online': 0})


@api_bp.route('/online-players')
def online_players():
    """Joueurs connectés avec leur zone."""
    try:
        cutoff = int(time.time()) - 600
        rows = _safe_query(
            "SELECT c.name, al.map_id FROM activity_log al "
            "JOIN charinfo c ON al.character_id=c.id "
            "WHERE al.activity=0 AND al.time > :t "
            "AND NOT EXISTS ("
            "  SELECT 1 FROM activity_log al2 "
            "  WHERE al2.character_id=al.character_id "
            "  AND al2.activity=1 AND al2.time > al.time"
            ")",
            {'t': cutoff}
        )
        return jsonify([
            {'name': r[0], 'zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}'), 'zone_id': r[1]}
            for r in rows
        ])
    except Exception:
        return jsonify([])


@api_bp.route('/leaderboard')
def leaderboard():
    try:
        rows = _safe_query(
            "SELECT c.name, c.last_zone, c.last_login FROM charinfo c "
            "ORDER BY c.last_login DESC LIMIT 10"
        )
        return jsonify([
            {'name': r[0], 'zone': ZONE_NAMES.get(r[1], '?'), 'last_login': str(r[2])}
            for r in rows
        ])
    except Exception:
        return jsonify([])
