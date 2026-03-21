# =============================================================
#  Universe Reborn — Play Keys Blueprint
#  CRUD complet : liste, creation bulk, edition, suppression,
#  vue detail (comptes associes), audit log
#  Parite NexusDashboard
# =============================================================
import random
import string
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from app import db
from app.models import AuditLog

play_keys_bp = Blueprint('play_keys', __name__)

GM_REQUIRED = 5  # niveau GM minimum pour gerer les play keys


def _conn():
    return db.engine.connect()


def _gm_required(level=GM_REQUIRED):
    if current_user.gm_level < level:
        abort(403)


def _gen_key():
    seg = lambda: ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'{seg()}-{seg()}-{seg()}-{seg()}'


def _log(action):
    try:
        db.session.add(AuditLog(
            account_id=current_user.id,
            username=current_user.username,
            action=action
        ))
        db.session.commit()
    except Exception:
        db.session.rollback()


# ---------------------------------------------------------------------------
# Liste des play keys
# ---------------------------------------------------------------------------
@play_keys_bp.route('/')
@login_required
def index():
    _gm_required()
    page = request.args.get('page', 1, type=int)
    q = request.args.get('q', '').strip()
    per_page = 25
    with _conn() as conn:
        if q:
            rows = conn.execute(db.text(
                "SELECT id, key_string, key_uses, active, notes, "
                "(SELECT COUNT(*) FROM accounts WHERE play_key_id=play_keys.id) as times_used "
                "FROM play_keys WHERE key_string LIKE :q ORDER BY id DESC LIMIT :lim OFFSET :off"
            ), {'q': f'%{q}%', 'lim': per_page, 'off': (page - 1) * per_page}).fetchall()
            total = conn.execute(db.text(
                "SELECT COUNT(*) FROM play_keys WHERE key_string LIKE :q"
            ), {'q': f'%{q}%'}).fetchone()[0]
        else:
            rows = conn.execute(db.text(
                "SELECT id, key_string, key_uses, active, notes, "
                "(SELECT COUNT(*) FROM accounts WHERE play_key_id=play_keys.id) as times_used "
                "FROM play_keys ORDER BY id DESC LIMIT :lim OFFSET :off"
            ), {'lim': per_page, 'off': (page - 1) * per_page}).fetchall()
            total = conn.execute(db.text("SELECT COUNT(*) FROM play_keys")).fetchone()[0]

    keys = [{
        'id': r[0], 'key_string': r[1], 'key_uses': r[2],
        'active': r[3], 'notes': r[4], 'times_used': r[5]
    } for r in rows]
    return render_template(
        'panel/play_keys/index.html',
        keys=keys, q=q, page=page, total=total, per_page=per_page
    )


# ---------------------------------------------------------------------------
# Vue detail d'une cle (comptes qui l'ont utilisee)
# ---------------------------------------------------------------------------
@play_keys_bp.route('/<int:kid>')
@login_required
def view(kid):
    _gm_required()
    with _conn() as conn:
        key = conn.execute(db.text(
            "SELECT id, key_string, key_uses, active, notes FROM play_keys WHERE id = :id"
        ), {'id': kid}).fetchone()
        if not key:
            abort(404)
        accounts = conn.execute(db.text(
            "SELECT id, name, gm_level, banned FROM accounts WHERE play_key_id = :kid"
        ), {'kid': kid}).fetchall()
    key_data = {'id': key[0], 'key_string': key[1], 'key_uses': key[2], 'active': key[3], 'notes': key[4]}
    acc_list = [{'id': a[0], 'name': a[1], 'gm_level': a[2], 'banned': a[3]} for a in accounts]
    return render_template('panel/play_keys/view.html', key=key_data, accounts=acc_list)


# ---------------------------------------------------------------------------
# Creation bulk de cles
# ---------------------------------------------------------------------------
@play_keys_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    _gm_required()
    error = None
    if request.method == 'POST':
        count = min(request.form.get('count', 1, type=int), 100)
        uses = max(request.form.get('uses', 1, type=int), 1)
        notes = request.form.get('notes', '').strip()
        generated = []
        with _conn() as conn:
            for _ in range(count):
                k = _gen_key()
                conn.execute(db.text(
                    "INSERT INTO play_keys (key_string, key_uses, active, notes) VALUES (:k, :u, 1, :n)"
                ), {'k': k, 'u': uses, 'n': notes})
                generated.append(k)
            conn.commit()
        _log(f"Cree {count} Play Key(s) avec {uses} utilisation(s)")
        flash(f'{count} cle(s) generee(s) avec {uses} utilisation(s).', 'success')
        return redirect(url_for('play_keys.index'))
    return render_template('panel/play_keys/create.html', error=error)


# ---------------------------------------------------------------------------
# Edition d'une cle existante
# ---------------------------------------------------------------------------
@play_keys_bp.route('/<int:kid>/edit', methods=['GET', 'POST'])
@login_required
def edit(kid):
    _gm_required()
    with _conn() as conn:
        key = conn.execute(db.text(
            "SELECT id, key_string, key_uses, active, notes FROM play_keys WHERE id = :id"
        ), {'id': kid}).fetchone()
        if not key:
            abort(404)

        if request.method == 'POST':
            uses = max(request.form.get('uses', 0, type=int), 0)
            active = 1 if 'active' in request.form else 0
            notes = request.form.get('notes', '').strip()
            conn.execute(db.text(
                "UPDATE play_keys SET key_uses = :u, active = :a, notes = :n WHERE id = :id"
            ), {'u': uses, 'a': active, 'n': notes, 'id': kid})
            conn.commit()
            _log(f"Modifie Play Key {key[1]} : uses={uses}, active={active}, notes={notes}")
            flash(f'Cle {key[1]} mise a jour.', 'success')
            return redirect(url_for('play_keys.view', kid=kid))

    key_data = {'id': key[0], 'key_string': key[1], 'key_uses': key[2], 'active': key[3], 'notes': key[4]}
    return render_template('panel/play_keys/edit.html', key=key_data)


# ---------------------------------------------------------------------------
# Suppression d'une cle
# ---------------------------------------------------------------------------
@play_keys_bp.route('/<int:kid>/delete', methods=['POST'])
@login_required
def delete(kid):
    _gm_required()
    with _conn() as conn:
        key = conn.execute(db.text(
            "SELECT key_string FROM play_keys WHERE id = :id"
        ), {'id': kid}).fetchone()
        if not key:
            abort(404)
        conn.execute(db.text("DELETE FROM play_keys WHERE id = :id"), {'id': kid})
        conn.commit()
    _log(f"Supprime Play Key {key[0]}")
    flash(f'Cle {key[0]} supprimee.', 'danger')
    return redirect(url_for('play_keys.index'))


# ---------------------------------------------------------------------------
# Toggle active/inactive
# ---------------------------------------------------------------------------
@play_keys_bp.route('/<int:kid>/toggle', methods=['POST'])
@login_required
def toggle(kid):
    _gm_required()
    with _conn() as conn:
        key = conn.execute(db.text(
            "SELECT key_string, active FROM play_keys WHERE id = :id"
        ), {'id': kid}).fetchone()
        if not key:
            abort(404)
        new_active = 0 if key[1] else 1
        conn.execute(db.text(
            "UPDATE play_keys SET active = :a WHERE id = :id"
        ), {'a': new_active, 'id': kid})
        conn.commit()
    label = 'activee' if new_active else 'desactivee'
    _log(f"Play Key {key[0]} {label}")
    flash(f'Cle {key[0]} {label}.', 'success')
    return redirect(url_for('play_keys.index'))
