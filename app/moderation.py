# =============================================================
#  Universe Reborn — Moderation Blueprint
#  - Moderation des noms de pets (pet_names DarkflameServer)
#  - Moderation des noms de personnages (pending_name)
#  - Rapports de bugs (utilisateurs)
#  - Audit log
#  Parite NexusDashboard
# =============================================================
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from app import db
from app.models import BugReport, AuditLog

moderation_bp = Blueprint('moderation', __name__)


def _conn():
    return db.engine.connect()


def _mod_required():
    if not current_user.is_mod:
        abort(403)


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


# ===========================================================================
# RAPPORT DE BUG (utilisateurs connectes)
# ===========================================================================
@moderation_bp.route('/report-bug', methods=['GET', 'POST'])
@login_required
def report_bug():
    error = None
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        desc = request.form.get('description', '').strip()
        if not title or not desc:
            error = 'Titre et description obligatoires.'
        else:
            db.session.add(BugReport(
                account_id=current_user.id,
                reporter_name=current_user.username,
                title=title,
                description=desc
            ))
            db.session.commit()
            flash('Rapport envoye, merci !', 'success')
            return redirect(url_for('accounts.dashboard'))
    return render_template('panel/report_bug.html', error=error)


# ===========================================================================
# NOMS DE PETS — moderation (GM >= 3)
# On lit directement dans la table pet_names de DarkflameServer
# ===========================================================================
@moderation_bp.route('/pets')
@login_required
def pets_index():
    _mod_required()
    status = request.args.get('status', 'pending')  # pending / approved / rejected / all
    page = request.args.get('page', 1, type=int)
    per_page = 30

    status_filter = {
        'pending': "WHERE p.approved = 1",
        'approved': "WHERE p.approved = 2",
        'rejected': "WHERE p.approved = 0",
        'all': "",
    }.get(status, "WHERE p.approved = 1")

    try:
        with _conn() as conn:
            rows = conn.execute(db.text(
                f"SELECT p.id, p.pet_name, p.approved, p.owner_id, c.name "
                f"FROM pet_names p "
                f"LEFT JOIN charinfo c ON p.owner_id = c.id "
                f"{status_filter} "
                f"ORDER BY p.id DESC LIMIT :lim OFFSET :off"
            ), {'lim': per_page, 'off': (page - 1) * per_page}).fetchall()
            total = conn.execute(db.text(
                f"SELECT COUNT(*) FROM pet_names p {status_filter}"
            )).fetchone()[0]
        pets = [{
            'id': r[0], 'pet_name': r[1],
            'approved': r[2], 'owner_id': r[3], 'owner_name': r[4]
        } for r in rows]
    except Exception:
        pets = []
        total = 0
        flash('La table pet_names est introuvable dans la base DarkflameServer.', 'warning')

    return render_template(
        'panel/moderation/pets.html',
        pets=pets, status=status, page=page, total=total, per_page=per_page
    )


@moderation_bp.route('/pets/<int:pet_id>/approve', methods=['POST'])
@login_required
def approve_pet(pet_id):
    _mod_required()
    try:
        with _conn() as conn:
            row = conn.execute(db.text(
                "SELECT pet_name FROM pet_names WHERE id = :id"
            ), {'id': pet_id}).fetchone()
            if not row:
                abort(404)
            conn.execute(db.text(
                "UPDATE pet_names SET approved = 2 WHERE id = :id"
            ), {'id': pet_id})
            conn.commit()
        _log(f"Approuve nom de pet '{row[0]}' (id={pet_id})")
        flash(f"Nom '{row[0]}' approuve.", 'success')
    except Exception as e:
        flash(f'Erreur : {e}', 'danger')
    return redirect(request.referrer or url_for('moderation.pets_index'))


@moderation_bp.route('/pets/<int:pet_id>/reject', methods=['POST'])
@login_required
def reject_pet(pet_id):
    _mod_required()
    try:
        with _conn() as conn:
            row = conn.execute(db.text(
                "SELECT pet_name FROM pet_names WHERE id = :id"
            ), {'id': pet_id}).fetchone()
            if not row:
                abort(404)
            conn.execute(db.text(
                "UPDATE pet_names SET approved = 0 WHERE id = :id"
            ), {'id': pet_id})
            conn.commit()
        _log(f"Rejete nom de pet '{row[0]}' (id={pet_id})")
        flash(f"Nom '{row[0]}' rejete.", 'danger')
    except Exception as e:
        flash(f'Erreur : {e}', 'danger')
    return redirect(request.referrer or url_for('moderation.pets_index'))


# ===========================================================================
# NOMS DE PERSONNAGES EN ATTENTE (pending_name) — GM >= 3
# ===========================================================================
@moderation_bp.route('/names')
@login_required
def names_index():
    _mod_required()
    page = request.args.get('page', 1, type=int)
    per_page = 30
    status = request.args.get('status', 'pending')  # pending / needs_rename / all

    if status == 'pending':
        where = "WHERE c.pending_name != '' AND c.needs_rename = 0"
    elif status == 'needs_rename':
        where = "WHERE c.needs_rename = 1"
    else:
        where = "WHERE c.pending_name != '' OR c.needs_rename = 1"

    try:
        with _conn() as conn:
            rows = conn.execute(db.text(
                f"SELECT c.id, c.name, c.pending_name, c.needs_rename, a.name "
                f"FROM charinfo c "
                f"JOIN accounts a ON c.account_id = a.id "
                f"{where} "
                f"ORDER BY c.id DESC LIMIT :lim OFFSET :off"
            ), {'lim': per_page, 'off': (page - 1) * per_page}).fetchall()
            total = conn.execute(
                db.text(f"SELECT COUNT(*) FROM charinfo c JOIN accounts a ON c.account_id = a.id {where}")
            ).fetchone()[0]
        chars = [{
            'id': r[0], 'name': r[1], 'pending_name': r[2],
            'needs_rename': r[3], 'account_name': r[4]
        } for r in rows]
    except Exception:
        chars = []
        total = 0

    return render_template(
        'panel/moderation/names.html',
        chars=chars, status=status, page=page, total=total, per_page=per_page
    )


@moderation_bp.route('/names/<int:char_id>/approve', methods=['POST'])
@login_required
def approve_name(char_id):
    _mod_required()
    with _conn() as conn:
        char = conn.execute(db.text(
            "SELECT name, pending_name FROM charinfo WHERE id = :id"
        ), {'id': char_id}).fetchone()
        if not char:
            abort(404)
        if char[1]:
            conn.execute(db.text(
                "UPDATE charinfo SET name = pending_name, pending_name = '', needs_rename = 0 WHERE id = :id"
            ), {'id': char_id})
            conn.commit()
            _log(f"Approuve nom '{char[1]}' pour perso ({char_id}){char[0]}")
            flash(f"Nom '{char[1]}' approuve.", 'success')
        else:
            flash('Aucun nom en attente.', 'warning')
    return redirect(request.referrer or url_for('moderation.names_index'))


@moderation_bp.route('/names/<int:char_id>/rename', methods=['POST'])
@login_required
def force_rename(char_id):
    _mod_required()
    with _conn() as conn:
        char = conn.execute(db.text(
            "SELECT name FROM charinfo WHERE id = :id"
        ), {'id': char_id}).fetchone()
        if not char:
            abort(404)
        conn.execute(db.text(
            "UPDATE charinfo SET needs_rename = 1 WHERE id = :id"
        ), {'id': char_id})
        conn.commit()
    _log(f"Marque ({char_id}){char[0]} pour renommage force")
    flash(f'{char[0]} marque pour renommage.', 'warning')
    return redirect(request.referrer or url_for('moderation.names_index'))


# ===========================================================================
# VUE AUDIT LOG — Admin seulement
# ===========================================================================
@moderation_bp.route('/audit')
@login_required
def audit_log():
    if not current_user.is_admin:
        abort(403)
    page = request.args.get('page', 1, type=int)
    per_page = 50
    total = AuditLog.query.count()
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()) \
        .offset((page - 1) * per_page).limit(per_page).all()
    return render_template(
        'panel/moderation/audit_log.html',
        logs=logs, page=page, total=total, per_page=per_page
    )
