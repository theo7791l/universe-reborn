# =============================================================
#  Universe Reborn — API REST Blueprint
#  Tous les endpoints consommés par le frontend React
#  Authentification : JWT (flask-jwt-extended)
# =============================================================
import time
from datetime import datetime
from functools import wraps

from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import (
    jwt_required, get_jwt_identity,
    create_access_token, create_refresh_token,
    get_jwt
)
from bcrypt import checkpw, hashpw, gensalt

from app import db
from app.models import NewsArticle, BugReport, AuditLog, ZONE_NAMES

api_bp = Blueprint('api', __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _conn():
    return db.engine.connect()


def _require_gm(min_level=4):
    """Décorateur : vérifie que le JWT contient gm_level >= min_level."""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def wrapped(*args, **kwargs):
            claims = get_jwt()
            if claims.get('gm_level', 0) < min_level:
                return jsonify({'error': 'Forbidden'}), 403
            return f(*args, **kwargs)
        return wrapped
    return decorator


def _account_to_dict(row):
    return {
        'id': row[0], 'name': row[1], 'gm_level': row[2],
        'banned': bool(row[3]), 'locked': bool(row[4]),
        'mute_expire': row[5], 'play_key_id': row[6],
        'created_at': str(row[7]) if row[7] else None,
    }


def _char_to_dict(row):
    return {
        'id': row[0], 'name': row[1], 'account_id': row[2],
        'zone': ZONE_NAMES.get(row[3], f'Zone {row[3]}'), 'zone_id': row[3],
        'last_login': str(row[4]) if row[4] else None,
        'account_name': row[5] if len(row) > 5 else None,
        'gm_level': row[6] if len(row) > 6 else 0,
    }


# ---------------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------------
@api_bp.route('/auth/login', methods=['POST'])
def auth_login():
    import hashlib
    data = request.get_json(force=True)
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    if not username or not password:
        return jsonify({'error': 'Identifiants manquants'}), 400
    with _conn() as conn:
        row = conn.execute(
            db.text("SELECT id, password, gm_level, banned, locked FROM accounts WHERE name = :n"),
            {'n': username}
        ).fetchone()
    if not row:
        return jsonify({'error': 'Identifiants incorrects'}), 401
    if row[3]:
        return jsonify({'error': 'Compte banni'}), 403
    if row[4]:
        return jsonify({'error': 'Compte verrouillé'}), 403
    old_hash = hashlib.sha512((password + username).encode()).hexdigest()
    try:
        valid = (old_hash == row[1]) or checkpw(password.encode(), row[1].encode())
    except Exception:
        valid = False
    if not valid:
        return jsonify({'error': 'Identifiants incorrects'}), 401
    additional = {'gm_level': row[2], 'username': username}
    access  = create_access_token(identity=str(row[0]), additional_claims=additional)
    refresh = create_refresh_token(identity=str(row[0]), additional_claims=additional)
    return jsonify({
        'access_token': access,
        'refresh_token': refresh,
        'user': {'id': row[0], 'username': username, 'gm_level': row[2]}
    })


@api_bp.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def auth_refresh():
    identity = get_jwt_identity()
    claims   = get_jwt()
    additional = {'gm_level': claims.get('gm_level', 0), 'username': claims.get('username', '')}
    access = create_access_token(identity=identity, additional_claims=additional)
    return jsonify({'access_token': access})


@api_bp.route('/auth/me')
@jwt_required()
def auth_me():
    uid = int(get_jwt_identity())
    claims = get_jwt()
    return jsonify({'id': uid, 'username': claims.get('username'), 'gm_level': claims.get('gm_level', 0)})


# ---------------------------------------------------------------------------
# STATUS / ONLINE
# ---------------------------------------------------------------------------
@api_bp.route('/status')
def server_status():
    try:
        with _conn() as conn:
            total = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
            chars = conn.execute(db.text("SELECT COUNT(*) FROM charinfo")).fetchone()[0]
        return jsonify({'online': True, 'total_users': total, 'total_characters': chars, 'players_online': 0})
    except Exception as e:
        return jsonify({'online': False, 'error': str(e), 'total_users': 0, 'total_characters': 0, 'players_online': 0})


@api_bp.route('/online-players')
def online_players():
    try:
        cutoff = int(time.time()) - 600
        with _conn() as conn:
            rows = conn.execute(db.text(
                "SELECT c.name, al.map_id FROM activity_log al "
                "JOIN charinfo c ON al.character_id=c.id "
                "WHERE al.activity=0 AND al.time > :t "
                "AND NOT EXISTS (SELECT 1 FROM activity_log al2 WHERE al2.character_id=al.character_id "
                "AND al2.activity=1 AND al2.time > al.time)"
            ), {'t': cutoff}).fetchall()
        return jsonify([{'name': r[0], 'zone': ZONE_NAMES.get(r[1], f'Zone {r[1]}')} for r in rows])
    except Exception:
        return jsonify([])


# ---------------------------------------------------------------------------
# NEWS (public)
# ---------------------------------------------------------------------------
@api_bp.route('/news')
def news_list():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category', None)
    q = NewsArticle.query.filter_by(is_published=True)
    if category:
        q = q.filter_by(category=category)
    q = q.order_by(NewsArticle.published_at.desc())
    total   = q.count()
    articles = q.offset((page - 1) * per_page).limit(per_page).all()
    return jsonify({
        'total': total, 'page': page, 'per_page': per_page,
        'items': [{
            'id': a.id, 'title': a.title, 'slug': a.slug,
            'excerpt': a.excerpt, 'cover_image': a.cover_image,
            'category': a.category, 'author_name': a.author_name,
            'published_at': a.published_at.isoformat() if a.published_at else None,
        } for a in articles]
    })


@api_bp.route('/news/<slug>')
def news_detail(slug):
    a = NewsArticle.query.filter_by(slug=slug, is_published=True).first_or_404()
    return jsonify({
        'id': a.id, 'title': a.title, 'slug': a.slug,
        'content': a.content, 'excerpt': a.excerpt,
        'cover_image': a.cover_image, 'category': a.category,
        'author_name': a.author_name,
        'published_at': a.published_at.isoformat() if a.published_at else None,
    })


# ---------------------------------------------------------------------------
# LEADERBOARD (public)
# ---------------------------------------------------------------------------
@api_bp.route('/leaderboard')
def leaderboard():
    try:
        limit = min(request.args.get('limit', 10, type=int), 100)
        sort  = request.args.get('sort', 'uscore')  # uscore | coins
        with _conn() as conn:
            if sort == 'coins':
                rows = conn.execute(db.text(
                    "SELECT c.name, c.last_zone, c.coins, c.level "
                    "FROM charinfo c WHERE c.name NOT IN "
                    "(SELECT name FROM accounts WHERE gm_level >= 3) "
                    "ORDER BY c.coins DESC LIMIT :l"
                ), {'l': limit}).fetchall()
                return jsonify([{'rank': i+1, 'name': r[0],
                                 'zone': ZONE_NAMES.get(r[1], '?'),
                                 'value': r[2], 'level': r[3],
                                 'type': 'coins'} for i, r in enumerate(rows)])
            else:
                rows = conn.execute(db.text(
                    "SELECT c.name, c.last_zone, c.uscore, c.level "
                    "FROM charinfo c WHERE c.name NOT IN "
                    "(SELECT name FROM accounts WHERE gm_level >= 3) "
                    "ORDER BY c.uscore DESC LIMIT :l"
                ), {'l': limit}).fetchall()
                return jsonify([{'rank': i+1, 'name': r[0],
                                 'zone': ZONE_NAMES.get(r[1], '?'),
                                 'value': r[2], 'level': r[3],
                                 'type': 'uscore'} for i, r in enumerate(rows)])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# PLAYER DASHBOARD (joueur connecté, GM non requis)
# ---------------------------------------------------------------------------
@api_bp.route('/player/me')
@jwt_required()
def player_me():
    uid = int(get_jwt_identity())
    with _conn() as conn:
        acc = conn.execute(
            db.text("SELECT id, name, gm_level, banned, locked, mute_expire, play_key_id, created_at "
                    "FROM accounts WHERE id=:id"), {'id': uid}
        ).fetchone()
        if not acc:
            return jsonify({'error': 'Not found'}), 404
        chars = conn.execute(
            db.text("SELECT id, name, last_zone, last_login, level, uscore, coins "
                    "FROM charinfo WHERE account_id=:aid ORDER BY last_login DESC"),
            {'aid': uid}
        ).fetchall()
    return jsonify({
        'account': {
            'id': acc[0], 'name': acc[1], 'gm_level': acc[2],
            'mute_expire': acc[5],
            'created_at': str(acc[7]) if acc[7] else None,
        },
        'characters': [{
            'id': c[0], 'name': c[1],
            'zone': ZONE_NAMES.get(c[2], f'Zone {c[2]}'),
            'last_login': str(c[3]) if c[3] else None,
            'level': c[4], 'uscore': c[5], 'coins': c[6],
        } for c in chars]
    })


@api_bp.route('/player/change-password', methods=['POST'])
@jwt_required()
def player_change_password():
    uid  = int(get_jwt_identity())
    data = request.get_json(force=True)
    current_pw = data.get('current_password', '')
    new_pw     = data.get('new_password', '')
    if len(new_pw) < 8:
        return jsonify({'error': 'Mot de passe trop court (8 car. min)'}), 400
    with _conn() as conn:
        row = conn.execute(
            db.text("SELECT password FROM accounts WHERE id=:id"), {'id': uid}
        ).fetchone()
        try:
            valid = checkpw(current_pw.encode(), row[0].encode())
        except Exception:
            valid = False
        if not valid:
            return jsonify({'error': 'Mot de passe actuel incorrect'}), 400
        new_hash = hashpw(new_pw.encode(), gensalt(prefix=b'2a')).decode()
        conn.execute(db.text("UPDATE accounts SET password=:p WHERE id=:id"), {'p': new_hash, 'id': uid})
        conn.commit()
    return jsonify({'success': True})


# ---------------------------------------------------------------------------
# ADMIN — ACCOUNTS
# ---------------------------------------------------------------------------
@api_bp.route('/admin/accounts')
@_require_gm(4)
def admin_accounts():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)
    q_str    = request.args.get('q', '')
    with _conn() as conn:
        if q_str:
            rows = conn.execute(db.text(
                "SELECT id, name, gm_level, banned, locked, mute_expire, play_key_id, created_at "
                "FROM accounts WHERE name LIKE :q ORDER BY id DESC LIMIT :l OFFSET :o"
            ), {'q': f'%{q_str}%', 'l': per_page, 'o': (page-1)*per_page}).fetchall()
            total = conn.execute(
                db.text("SELECT COUNT(*) FROM accounts WHERE name LIKE :q"), {'q': f'%{q_str}%'}
            ).fetchone()[0]
        else:
            rows = conn.execute(db.text(
                "SELECT id, name, gm_level, banned, locked, mute_expire, play_key_id, created_at "
                "FROM accounts ORDER BY id DESC LIMIT :l OFFSET :o"
            ), {'l': per_page, 'o': (page-1)*per_page}).fetchall()
            total = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
    return jsonify({'total': total, 'page': page, 'per_page': per_page,
                    'items': [_account_to_dict(r) for r in rows]})


@api_bp.route('/admin/accounts/<int:uid>')
@_require_gm(4)
def admin_account_detail(uid):
    with _conn() as conn:
        acc = conn.execute(
            db.text("SELECT id, name, gm_level, banned, locked, mute_expire, play_key_id, created_at "
                    "FROM accounts WHERE id=:id"), {'id': uid}
        ).fetchone()
        if not acc:
            return jsonify({'error': 'Not found'}), 404
        chars = conn.execute(
            db.text("SELECT id, name, last_zone, last_login, level, uscore, coins "
                    "FROM charinfo WHERE account_id=:aid ORDER BY last_login DESC"),
            {'aid': uid}
        ).fetchall()
    return jsonify({
        'account': _account_to_dict(acc),
        'characters': [{
            'id': c[0], 'name': c[1],
            'zone': ZONE_NAMES.get(c[2], f'Zone {c[2]}'),
            'last_login': str(c[3]) if c[3] else None,
            'level': c[4], 'uscore': c[5], 'coins': c[6],
        } for c in chars]
    })


@api_bp.route('/admin/accounts/<int:uid>/ban', methods=['POST'])
@_require_gm(4)
def admin_ban(uid):
    data   = request.get_json(force=True) or {}
    reason = data.get('reason', 'Non précisée')
    actor  = int(get_jwt_identity())
    with _conn() as conn:
        row = conn.execute(db.text("SELECT gm_level, name FROM accounts WHERE id=:id"), {'id': uid}).fetchone()
        if not row: return jsonify({'error': 'Not found'}), 404
        if row[0] >= 9: return jsonify({'error': 'Cannot ban GM9'}), 403
        conn.execute(db.text("UPDATE accounts SET banned=1, ban_reason=:r WHERE id=:id"), {'r': reason, 'id': uid})
        conn.commit()
    AuditLog.log(actor_id=actor, action='ban', target_type='account', target_id=uid, detail=reason)
    return jsonify({'success': True})


@api_bp.route('/admin/accounts/<int:uid>/unban', methods=['POST'])
@_require_gm(4)
def admin_unban(uid):
    actor = int(get_jwt_identity())
    with _conn() as conn:
        conn.execute(db.text("UPDATE accounts SET banned=0, ban_reason=NULL WHERE id=:id"), {'id': uid})
        conn.commit()
    AuditLog.log(actor_id=actor, action='unban', target_type='account', target_id=uid)
    return jsonify({'success': True})


@api_bp.route('/admin/accounts/<int:uid>/lock', methods=['POST'])
@_require_gm(4)
def admin_lock(uid):
    actor = int(get_jwt_identity())
    with _conn() as conn:
        row = conn.execute(db.text("SELECT locked FROM accounts WHERE id=:id"), {'id': uid}).fetchone()
        if not row: return jsonify({'error': 'Not found'}), 404
        new_state = 0 if row[0] else 1
        conn.execute(db.text("UPDATE accounts SET locked=:l WHERE id=:id"), {'l': new_state, 'id': uid})
        conn.commit()
    AuditLog.log(actor_id=actor, action='lock' if new_state else 'unlock', target_type='account', target_id=uid)
    return jsonify({'success': True, 'locked': bool(new_state)})


@api_bp.route('/admin/accounts/<int:uid>/mute', methods=['POST'])
@_require_gm(4)
def admin_mute(uid):
    data   = request.get_json(force=True) or {}
    # expire : timestamp unix ou 0 pour démuter
    expire = data.get('expire', int(time.time()) + 86400)
    actor  = int(get_jwt_identity())
    with _conn() as conn:
        conn.execute(db.text("UPDATE accounts SET mute_expire=:e WHERE id=:id"), {'e': expire, 'id': uid})
        conn.commit()
    action = 'unmute' if expire == 0 else 'mute'
    AuditLog.log(actor_id=actor, action=action, target_type='account', target_id=uid,
                 detail=f'expire={expire}')
    return jsonify({'success': True, 'mute_expire': expire})


@api_bp.route('/admin/accounts/<int:uid>/setgm', methods=['POST'])
@_require_gm(9)
def admin_set_gm(uid):
    data  = request.get_json(force=True) or {}
    level = int(data.get('level', 0))
    actor = int(get_jwt_identity())
    if level < 0 or level > 9:
        return jsonify({'error': 'Invalid level'}), 400
    with _conn() as conn:
        conn.execute(db.text("UPDATE accounts SET gm_level=:l WHERE id=:id"), {'l': level, 'id': uid})
        conn.commit()
    AuditLog.log(actor_id=actor, action='set_gm', target_type='account', target_id=uid,
                 detail=f'level={level}')
    return jsonify({'success': True, 'gm_level': level})


@api_bp.route('/admin/accounts/<int:uid>', methods=['DELETE'])
@_require_gm(9)
def admin_delete_account(uid):
    actor = int(get_jwt_identity())
    with _conn() as conn:
        # Supprimer les personnages liés puis le compte
        char_ids = conn.execute(
            db.text("SELECT id FROM charinfo WHERE account_id=:aid"), {'aid': uid}
        ).fetchall()
        for (cid,) in char_ids:
            conn.execute(db.text("DELETE FROM charxml WHERE id=:id"), {'id': cid})
            conn.execute(db.text("DELETE FROM inventory WHERE char_id=:id"), {'id': cid})
            conn.execute(db.text("DELETE FROM charinfo WHERE id=:id"), {'id': cid})
        conn.execute(db.text("DELETE FROM accounts WHERE id=:id"), {'id': uid})
        conn.commit()
    AuditLog.log(actor_id=actor, action='delete_account', target_type='account', target_id=uid)
    return jsonify({'success': True})


# ---------------------------------------------------------------------------
# ADMIN — CHARACTERS
# ---------------------------------------------------------------------------
@api_bp.route('/admin/characters')
@_require_gm(4)
def admin_characters():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)
    q_str    = request.args.get('q', '')
    with _conn() as conn:
        base = (
            "SELECT c.id, c.name, c.account_id, c.last_zone, c.last_login, a.name, a.gm_level "
            "FROM charinfo c JOIN accounts a ON c.account_id=a.id "
        )
        if q_str:
            rows = conn.execute(db.text(
                base + "WHERE c.name LIKE :q ORDER BY c.last_login DESC LIMIT :l OFFSET :o"
            ), {'q': f'%{q_str}%', 'l': per_page, 'o': (page-1)*per_page}).fetchall()
            total = conn.execute(
                db.text("SELECT COUNT(*) FROM charinfo WHERE name LIKE :q"), {'q': f'%{q_str}%'}
            ).fetchone()[0]
        else:
            rows = conn.execute(db.text(
                base + "ORDER BY c.last_login DESC LIMIT :l OFFSET :o"
            ), {'l': per_page, 'o': (page-1)*per_page}).fetchall()
            total = conn.execute(db.text("SELECT COUNT(*) FROM charinfo")).fetchone()[0]
    return jsonify({'total': total, 'page': page, 'per_page': per_page,
                    'items': [_char_to_dict(r) for r in rows]})


@api_bp.route('/admin/characters/<int:cid>')
@_require_gm(4)
def admin_character_detail(cid):
    with _conn() as conn:
        row = conn.execute(
            db.text(
                "SELECT c.id, c.name, c.account_id, c.last_zone, c.last_login, a.name, a.gm_level, "
                "c.level, c.uscore, c.coins, c.hair_color, c.chest, c.legs, c.head, "
                "c.is_racing_muted, c.chat_muted, c.trade_muted "
                "FROM charinfo c JOIN accounts a ON c.account_id=a.id WHERE c.id=:id"
            ), {'id': cid}
        ).fetchone()
        if not row: return jsonify({'error': 'Not found'}), 404
        # Inventaire (backpack)
        inv = conn.execute(db.text(
            "SELECT lot, count, slot FROM inventory WHERE char_id=:id AND type=0 ORDER BY slot"
        ), {'id': cid}).fetchall()
    return jsonify({
        'id': row[0], 'name': row[1], 'account_id': row[2],
        'zone': ZONE_NAMES.get(row[3], f'Zone {row[3]}'), 'zone_id': row[3],
        'last_login': str(row[4]) if row[4] else None,
        'account_name': row[5], 'gm_level': row[6],
        'level': row[7], 'uscore': row[8], 'coins': row[9],
        'is_racing_muted': bool(row[14]),
        'chat_muted': bool(row[15]),
        'trade_muted': bool(row[16]),
        'inventory': [{'lot': i[0], 'count': i[1], 'slot': i[2]} for i in inv]
    })


@api_bp.route('/admin/characters/<int:cid>/rescue', methods=['POST'])
@_require_gm(4)
def admin_character_rescue(cid):
    """Téléporte le personnage vers une zone précédemment visitée."""
    data    = request.get_json(force=True) or {}
    zone_id = int(data.get('zone_id', 1000))  # défaut : Venture Explorer
    actor   = int(get_jwt_identity())
    with _conn() as conn:
        row = conn.execute(db.text("SELECT name FROM charinfo WHERE id=:id"), {'id': cid}).fetchone()
        if not row: return jsonify({'error': 'Not found'}), 404
        conn.execute(db.text(
            "UPDATE charinfo SET last_zone=:z, last_instance=0, last_clone=0 WHERE id=:id"
        ), {'z': zone_id, 'id': cid})
        conn.commit()
    AuditLog.log(actor_id=actor, action='rescue', target_type='character', target_id=cid,
                 detail=f'zone={zone_id}')
    return jsonify({'success': True, 'zone_id': zone_id, 'zone': ZONE_NAMES.get(zone_id, f'Zone {zone_id}')})


@api_bp.route('/admin/characters/<int:cid>/restrictions', methods=['POST'])
@_require_gm(4)
def admin_character_restrictions(cid):
    """Toggle restrict trade / mail / chat."""
    data  = request.get_json(force=True) or {}
    actor = int(get_jwt_identity())
    fields = {}
    if 'trade_muted' in data:
        fields['trade_muted'] = int(bool(data['trade_muted']))
    if 'chat_muted' in data:
        fields['chat_muted'] = int(bool(data['chat_muted']))
    if 'is_racing_muted' in data:
        fields['is_racing_muted'] = int(bool(data['is_racing_muted']))
    if not fields:
        return jsonify({'error': 'No fields provided'}), 400
    set_clause = ', '.join(f'{k}=:{k}' for k in fields)
    fields['id'] = cid
    with _conn() as conn:
        conn.execute(db.text(f"UPDATE charinfo SET {set_clause} WHERE id=:id"), fields)
        conn.commit()
    detail = ', '.join(f'{k}={v}' for k, v in fields.items() if k != 'id')
    AuditLog.log(actor_id=actor, action='restrict', target_type='character', target_id=cid, detail=detail)
    return jsonify({'success': True})


# ---------------------------------------------------------------------------
# ADMIN — PLAY KEYS
# ---------------------------------------------------------------------------
@api_bp.route('/admin/play-keys')
@_require_gm(4)
def admin_play_keys():
    with _conn() as conn:
        rows = conn.execute(db.text(
            "SELECT pk.id, pk.key_string, pk.key_uses, pk.active, pk.notes, "
            "(SELECT COUNT(*) FROM accounts a WHERE a.play_key_id=pk.id) as used_by "
            "FROM play_keys pk ORDER BY pk.id DESC"
        )).fetchall()
    return jsonify([{'id': r[0], 'key_string': r[1], 'key_uses': r[2],
                     'active': bool(r[3]), 'notes': r[4], 'used_by': r[5]} for r in rows])


@api_bp.route('/admin/play-keys', methods=['POST'])
@_require_gm(4)
def admin_create_play_key():
    import random, string as slib
    data  = request.get_json(force=True) or {}
    count = min(int(data.get('count', 1)), 50)
    uses  = int(data.get('uses', 1))
    notes = data.get('notes', '')
    def _gen():
        seg = lambda: ''.join(random.choices(slib.ascii_uppercase + slib.digits, k=4))
        return f'{seg()}-{seg()}-{seg()}-{seg()}'
    generated = []
    with _conn() as conn:
        for _ in range(count):
            k = _gen()
            conn.execute(db.text(
                "INSERT INTO play_keys (key_string, key_uses, active, notes) VALUES (:k,:u,1,:n)"
            ), {'k': k, 'u': uses, 'n': notes})
            generated.append(k)
        conn.commit()
    return jsonify({'created': len(generated), 'keys': generated}), 201


@api_bp.route('/admin/play-keys/<int:kid>', methods=['DELETE'])
@_require_gm(4)
def admin_delete_play_key(kid):
    with _conn() as conn:
        conn.execute(db.text("DELETE FROM play_keys WHERE id=:id"), {'id': kid})
        conn.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/play-keys/<int:kid>', methods=['PATCH'])
@_require_gm(4)
def admin_edit_play_key(kid):
    data = request.get_json(force=True) or {}
    fields = {}
    if 'notes' in data: fields['notes'] = data['notes']
    if 'key_uses' in data: fields['key_uses'] = int(data['key_uses'])
    if 'active' in data: fields['active'] = int(bool(data['active']))
    if not fields: return jsonify({'error': 'Nothing to update'}), 400
    set_clause = ', '.join(f'{k}=:{k}' for k in fields)
    fields['id'] = kid
    with _conn() as conn:
        conn.execute(db.text(f"UPDATE play_keys SET {set_clause} WHERE id=:id"), fields)
        conn.commit()
    return jsonify({'success': True})


# ---------------------------------------------------------------------------
# ADMIN — MODERATION (noms personnages / pets)
# ---------------------------------------------------------------------------
@api_bp.route('/admin/moderation/char-names')
@_require_gm(4)
def admin_char_names():
    status = request.args.get('status', 'pending')  # pending | approved | rejected
    with _conn() as conn:
        rows = conn.execute(db.text(
            "SELECT cn.id, cn.requested_name, cn.approved, c.id, c.account_id "
            "FROM char_names cn JOIN charinfo c ON cn.char_id=c.id "
            "WHERE cn.approved=:s ORDER BY cn.id DESC LIMIT 100"
        ), {'s': 0 if status == 'pending' else (1 if status == 'approved' else 2)}).fetchall()
    return jsonify([{'id': r[0], 'requested_name': r[1], 'approved': r[2],
                     'char_id': r[3], 'account_id': r[4]} for r in rows])


@api_bp.route('/admin/moderation/char-names/<int:nid>', methods=['POST'])
@_require_gm(4)
def admin_moderate_char_name(nid):
    data   = request.get_json(force=True) or {}
    action = data.get('action')  # approve | reject
    actor  = int(get_jwt_identity())
    value  = 1 if action == 'approve' else 2
    with _conn() as conn:
        conn.execute(db.text("UPDATE char_names SET approved=:v WHERE id=:id"), {'v': value, 'id': nid})
        conn.commit()
    AuditLog.log(actor_id=actor, action=f'char_name_{action}', target_type='char_name', target_id=nid)
    return jsonify({'success': True})


@api_bp.route('/admin/moderation/pet-names')
@_require_gm(4)
def admin_pet_names():
    status = request.args.get('status', 'pending')
    with _conn() as conn:
        rows = conn.execute(db.text(
            "SELECT id, name, approved, owner_char_id "
            "FROM pet_names WHERE approved=:s ORDER BY id DESC LIMIT 100"
        ), {'s': 0 if status == 'pending' else (1 if status == 'approved' else 2)}).fetchall()
    return jsonify([{'id': r[0], 'name': r[1], 'approved': r[2], 'owner_char_id': r[3]} for r in rows])


@api_bp.route('/admin/moderation/pet-names/<int:nid>', methods=['POST'])
@_require_gm(4)
def admin_moderate_pet_name(nid):
    data   = request.get_json(force=True) or {}
    action = data.get('action')
    actor  = int(get_jwt_identity())
    value  = 1 if action == 'approve' else 2
    with _conn() as conn:
        conn.execute(db.text("UPDATE pet_names SET approved=:v WHERE id=:id"), {'v': value, 'id': nid})
        conn.commit()
    AuditLog.log(actor_id=actor, action=f'pet_name_{action}', target_type='pet_name', target_id=nid)
    return jsonify({'success': True})


@api_bp.route('/admin/moderation/cleanup-orphans', methods=['POST'])
@_require_gm(4)
def admin_cleanup_orphans():
    """Supprime les noms orphelins (persos/pets supprimés)."""
    actor = int(get_jwt_identity())
    with _conn() as conn:
        try:
            r1 = conn.execute(db.text(
                "DELETE FROM char_names WHERE char_id NOT IN (SELECT id FROM charinfo)"
            ))
        except Exception:
            r1 = None
        try:
            r2 = conn.execute(db.text(
                "DELETE FROM pet_names WHERE owner_char_id NOT IN (SELECT id FROM charinfo)"
            ))
        except Exception:
            r2 = None
        conn.commit()
    AuditLog.log(actor_id=actor, action='cleanup_orphans', target_type='moderation')
    return jsonify({'success': True,
                    'char_names_deleted': r1.rowcount if r1 else 0,
                    'pet_names_deleted': r2.rowcount if r2 else 0})


# ---------------------------------------------------------------------------
# ADMIN — PROPERTIES
# ---------------------------------------------------------------------------
@api_bp.route('/admin/properties')
@_require_gm(4)
def admin_properties():
    status = request.args.get('status', 'all')  # all | approved | pending
    with _conn() as conn:
        if status == 'approved':
            rows = conn.execute(db.text(
                "SELECT p.id, p.owner_id, p.template_id, p.zone_id, p.approved, c.name "
                "FROM properties p JOIN charinfo c ON p.owner_id=c.id "
                "WHERE p.approved=1 ORDER BY p.id DESC LIMIT 100"
            )).fetchall()
        elif status == 'pending':
            rows = conn.execute(db.text(
                "SELECT p.id, p.owner_id, p.template_id, p.zone_id, p.approved, c.name "
                "FROM properties p JOIN charinfo c ON p.owner_id=c.id "
                "WHERE p.approved=0 ORDER BY p.id DESC LIMIT 100"
            )).fetchall()
        else:
            rows = conn.execute(db.text(
                "SELECT p.id, p.owner_id, p.template_id, p.zone_id, p.approved, c.name "
                "FROM properties p JOIN charinfo c ON p.owner_id=c.id "
                "ORDER BY p.id DESC LIMIT 100"
            )).fetchall()
    return jsonify([{'id': r[0], 'owner_id': r[1], 'template_id': r[2],
                     'zone_id': r[3], 'approved': bool(r[4]), 'owner_name': r[5]} for r in rows])


@api_bp.route('/admin/properties/<int:pid>/approve', methods=['POST'])
@_require_gm(4)
def admin_approve_property(pid):
    data   = request.get_json(force=True) or {}
    state  = int(bool(data.get('approved', True)))
    actor  = int(get_jwt_identity())
    with _conn() as conn:
        conn.execute(db.text("UPDATE properties SET approved=:s WHERE id=:id"), {'s': state, 'id': pid})
        conn.commit()
    AuditLog.log(actor_id=actor, action='approve_property' if state else 'unapprove_property',
                 target_type='property', target_id=pid)
    return jsonify({'success': True, 'approved': bool(state)})


# ---------------------------------------------------------------------------
# ADMIN — SEND MAIL
# ---------------------------------------------------------------------------
@api_bp.route('/admin/mail/send', methods=['POST'])
@_require_gm(4)
def admin_send_mail():
    data           = request.get_json(force=True) or {}
    char_name      = (data.get('character_name') or '').strip()
    subject        = (data.get('subject') or '').strip()
    body           = (data.get('body') or '').strip()
    attachment_lot = int(data.get('attachment_lot', 0))
    attachment_count = int(data.get('attachment_count', 1))
    actor          = int(get_jwt_identity())
    if not char_name or not subject:
        return jsonify({'error': 'character_name and subject required'}), 400
    with _conn() as conn:
        char = conn.execute(
            db.text("SELECT id FROM charinfo WHERE name=:n"), {'n': char_name}
        ).fetchone()
        if not char:
            return jsonify({'error': f'Personnage "{char_name}" introuvable'}), 404
        send_time = int(time.time())
        conn.execute(db.text(
            "INSERT INTO mail (sender_id, receiver_id, subject, body, attachment_lot, "
            "attachment_count, send_time, was_read) "
            "VALUES (0, :rid, :sub, :body, :lot, :cnt, :t, 0)"
        ), {'rid': char[0], 'sub': subject, 'body': body,
            'lot': attachment_lot, 'cnt': attachment_count, 't': send_time})
        conn.commit()
    AuditLog.log(actor_id=actor, action='send_mail', target_type='character', target_id=char[0],
                 detail=f'subject={subject}, lot={attachment_lot}')
    return jsonify({'success': True, 'receiver_id': char[0]})


# ---------------------------------------------------------------------------
# ADMIN — BUG REPORTS
# ---------------------------------------------------------------------------
@api_bp.route('/admin/bug-reports')
@_require_gm(4)
def admin_bug_reports():
    status = request.args.get('status', 'open')
    page   = request.args.get('page', 1, type=int)
    per_page = 20
    q = BugReport.query
    if status != 'all':
        q = q.filter_by(status=status)
    total   = q.count()
    reports = q.order_by(BugReport.created_at.desc()).offset((page-1)*per_page).limit(per_page).all()
    return jsonify({'total': total, 'page': page, 'items': [{
        'id': r.id, 'title': r.title, 'description': r.description,
        'reporter_name': r.reporter_name, 'status': r.status,
        'created_at': r.created_at.isoformat(),
    } for r in reports]})


@api_bp.route('/admin/bug-reports/<int:rid>', methods=['PATCH'])
@_require_gm(4)
def admin_bug_report_update(rid):
    data = request.get_json(force=True) or {}
    r = BugReport.query.get_or_404(rid)
    if 'status' in data and data['status'] in ('open', 'in_progress', 'closed'):
        r.status = data['status']
        db.session.commit()
    return jsonify({'success': True, 'status': r.status})


# JOUEUR : soumettre un bug report
@api_bp.route('/bug-reports', methods=['POST'])
@jwt_required()
def submit_bug_report():
    uid   = int(get_jwt_identity())
    claims = get_jwt()
    data  = request.get_json(force=True) or {}
    title = (data.get('title') or '').strip()
    desc  = (data.get('description') or '').strip()
    if not title or not desc:
        return jsonify({'error': 'title and description required'}), 400
    r = BugReport(account_id=uid, reporter_name=claims.get('username','?'),
                  title=title, description=desc)
    db.session.add(r)
    db.session.commit()
    return jsonify({'success': True, 'id': r.id}), 201


# ---------------------------------------------------------------------------
# ADMIN — LOGS
# ---------------------------------------------------------------------------
@api_bp.route('/admin/logs/activity')
@_require_gm(4)
def admin_logs_activity():
    page     = request.args.get('page', 1, type=int)
    per_page = 50
    offset   = (page - 1) * per_page
    with _conn() as conn:
        rows = conn.execute(db.text(
            "SELECT al.id, al.character_id, c.name, al.activity, al.map_id, al.time "
            "FROM activity_log al LEFT JOIN charinfo c ON al.character_id=c.id "
            "ORDER BY al.time DESC LIMIT :l OFFSET :o"
        ), {'l': per_page, 'o': offset}).fetchall()
        total = conn.execute(db.text("SELECT COUNT(*) FROM activity_log")).fetchone()[0]
    return jsonify({'total': total, 'page': page, 'items': [{
        'id': r[0], 'char_id': r[1], 'char_name': r[2],
        'activity': r[3], 'zone': ZONE_NAMES.get(r[4], f'Zone {r[4]}'),
        'time': r[5]
    } for r in rows]})


@api_bp.route('/admin/logs/commands')
@_require_gm(4)
def admin_logs_commands():
    page     = request.args.get('page', 1, type=int)
    per_page = 50
    offset   = (page - 1) * per_page
    try:
        with _conn() as conn:
            rows = conn.execute(db.text(
                "SELECT cl.id, cl.character_id, c.name, cl.command, cl.time "
                "FROM command_log cl LEFT JOIN charinfo c ON cl.character_id=c.id "
                "ORDER BY cl.time DESC LIMIT :l OFFSET :o"
            ), {'l': per_page, 'o': offset}).fetchall()
            total = conn.execute(db.text("SELECT COUNT(*) FROM command_log")).fetchone()[0]
        return jsonify({'total': total, 'page': page, 'items': [{
            'id': r[0], 'char_id': r[1], 'char_name': r[2],
            'command': r[3], 'time': r[4]
        } for r in rows]})
    except Exception:
        return jsonify({'total': 0, 'page': 1, 'items': []})


@api_bp.route('/admin/logs/audit')
@_require_gm(4)
def admin_logs_audit():
    page     = request.args.get('page', 1, type=int)
    per_page = 50
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()) \
               .offset((page-1)*per_page).limit(per_page).all()
    total = AuditLog.query.count()
    return jsonify({'total': total, 'page': page, 'items': [{
        'id': l.id, 'actor_id': l.actor_id, 'action': l.action,
        'target_type': l.target_type, 'target_id': l.target_id,
        'detail': l.detail, 'created_at': l.created_at.isoformat()
    } for l in logs]})


# ---------------------------------------------------------------------------
# ADMIN — ECONOMY REPORTS
# ---------------------------------------------------------------------------
@api_bp.route('/admin/reports/currency')
@_require_gm(3)
def admin_report_currency():
    try:
        with _conn() as conn:
            rows = conn.execute(db.text(
                "SELECT c.name, c.coins, a.gm_level FROM charinfo c "
                "JOIN accounts a ON c.account_id=a.id "
                "WHERE a.gm_level < 3 ORDER BY c.coins DESC LIMIT 50"
            )).fetchall()
            total = conn.execute(db.text(
                "SELECT SUM(c.coins) FROM charinfo c "
                "JOIN accounts a ON c.account_id=a.id WHERE a.gm_level < 3"
            )).fetchone()[0]
        return jsonify({'total_coins': total or 0,
                        'top': [{'name': r[0], 'coins': r[1]} for r in rows]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/admin/reports/uscore')
@_require_gm(3)
def admin_report_uscore():
    try:
        with _conn() as conn:
            rows = conn.execute(db.text(
                "SELECT c.name, c.uscore FROM charinfo c "
                "JOIN accounts a ON c.account_id=a.id "
                "WHERE a.gm_level < 3 ORDER BY c.uscore DESC LIMIT 50"
            )).fetchall()
            total = conn.execute(db.text(
                "SELECT SUM(c.uscore) FROM charinfo c "
                "JOIN accounts a ON c.account_id=a.id WHERE a.gm_level < 3"
            )).fetchone()[0]
        return jsonify({'total_uscore': total or 0,
                        'top': [{'name': r[0], 'uscore': r[1]} for r in rows]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/admin/reports/items')
@_require_gm(3)
def admin_report_items():
    """Top items (lot) en existence dans inventaires + coffres."""
    try:
        with _conn() as conn:
            rows = conn.execute(db.text(
                "SELECT lot, SUM(count) as total FROM inventory "
                "WHERE char_id IN (SELECT c.id FROM charinfo c "
                "JOIN accounts a ON c.account_id=a.id WHERE a.gm_level < 3) "
                "GROUP BY lot ORDER BY total DESC LIMIT 100"
            )).fetchall()
        return jsonify([{'lot': r[0], 'total': r[1]} for r in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------------------------------------------------------------------
# ADMIN — OVERVIEW STATS
# ---------------------------------------------------------------------------
@api_bp.route('/admin/overview')
@_require_gm(4)
def admin_overview():
    try:
        with _conn() as conn:
            total_accounts  = conn.execute(db.text("SELECT COUNT(*) FROM accounts")).fetchone()[0]
            active_accounts = conn.execute(db.text("SELECT COUNT(*) FROM accounts WHERE banned=0 AND locked=0")).fetchone()[0]
            banned_accounts = conn.execute(db.text("SELECT COUNT(*) FROM accounts WHERE banned=1")).fetchone()[0]
            total_chars     = conn.execute(db.text("SELECT COUNT(*) FROM charinfo")).fetchone()[0]
            active_keys     = conn.execute(db.text("SELECT COUNT(*) FROM play_keys WHERE active=1 AND key_uses>0")).fetchone()[0]
            try:
                sessions_today = conn.execute(db.text(
                    "SELECT COUNT(*) FROM activity_log WHERE activity=0 AND time > :t"),
                    {'t': int(time.time()) - 86400}
                ).fetchone()[0]
            except Exception:
                sessions_today = 0
        return jsonify({
            'total_accounts': total_accounts,
            'active_accounts': active_accounts,
            'banned_accounts': banned_accounts,
            'total_characters': total_chars,
            'active_keys': active_keys,
            'sessions_today': sessions_today,
            'total_news': NewsArticle.query.count(),
            'open_bugs': BugReport.query.filter_by(status='open').count(),
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/admin/activity-data')
@_require_gm(4)
def admin_activity_data():
    """Données activité 7 derniers jours pour graphiques React."""
    import time as t_mod
    from datetime import datetime as dt
    epoch     = int(t_mod.time())
    labels    = []
    sessions  = []
    playtime  = []
    for i in range(6, -1, -1):
        day_start = epoch - (i + 1) * 86400
        day_end   = epoch - i * 86400
        labels.append(dt.fromtimestamp(day_end).strftime('%d/%m'))
        try:
            with _conn() as conn:
                s = conn.execute(db.text(
                    "SELECT COUNT(*) FROM activity_log WHERE activity=0 AND time>=:s AND time<:e"
                ), {'s': day_start, 'e': day_end}).fetchone()[0]
                sessions.append(s)
                logins  = conn.execute(db.text(
                    "SELECT character_id, time FROM activity_log WHERE activity=0 AND time>=:s AND time<:e"
                ), {'s': day_start, 'e': day_end}).fetchall()
                logouts = conn.execute(db.text(
                    "SELECT character_id, time FROM activity_log WHERE activity=1 AND time>=:s AND time<:e"
                ), {'s': day_start, 'e': day_end}).fetchall()
                logout_map = {r[0]: r[1] for r in logouts}
                total_secs = sum(
                    (logout_map[r[0]] - r[1]) for r in logins
                    if r[0] in logout_map and logout_map[r[0]] > r[1]
                )
                playtime.append(round(total_secs / 3600, 2))
        except Exception:
            sessions.append(0)
            playtime.append(0)
    return jsonify({'labels': labels, 'sessions': sessions, 'playtime': playtime})
