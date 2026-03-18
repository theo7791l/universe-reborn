# =============================================================
#  Universe Reborn — Accounts Blueprint
#  Travaille DIRECTEMENT sur la BDD DarkflameServer
#  Compatible bcrypt $2a$ (format DarkflameServer)
# =============================================================
import re
import hashlib
from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, request, Response
from flask_login import login_user, logout_user, login_required, current_user
from bcrypt import checkpw, hashpw, gensalt
from app import db
from app.models import UserModel, ZONE_NAMES

accounts_bp = Blueprint('accounts', __name__)


def _get_conn():
    return db.engine.connect()


@accounts_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('accounts.dashboard'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        remember = 'remember' in request.form
        with _get_conn() as conn:
            row = conn.execute(
                db.text("SELECT id, password, gm_level, banned, locked FROM accounts WHERE name = :n"),
                {'n': username}
            ).fetchone()
        if not row:
            error = 'Identifiants incorrects.'
        elif row[3]:  # banned
            error = 'Ce compte est banni.'
        elif row[4]:  # locked
            error = 'Ce compte est verrouillé.'
        else:
            pw_hash = row[1]
            # Support ancien hash SHA512 + nouveau bcrypt
            old_hash = hashlib.sha512((password + username).encode()).hexdigest()
            try:
                valid = (old_hash == pw_hash) or checkpw(password.encode(), pw_hash.encode())
            except Exception:
                valid = False
            if not valid:
                error = 'Identifiants incorrects.'
            else:
                user = UserModel(row[0], username, row[2])
                login_user(user, remember=remember)
                flash(f'Bienvenue, {username} !', 'success')
                return redirect(request.args.get('next') or url_for('accounts.dashboard'))
    return render_template('panel/login.html', error=error)


@accounts_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('accounts.dashboard'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        confirm  = request.form.get('confirm_password', '')
        key_str  = request.form.get('play_key', '').strip().upper()
        agree    = 'agree' in request.form

        if not agree:
            error = 'Vous devez accepter les conditions d\'utilisation.'
        elif not re.match(r'^[A-Za-z0-9_-]{3,32}$', username):
            error = 'Pseudo invalide (3-32 caractères, lettres/chiffres/-/_).'
        elif password != confirm:
            error = 'Les mots de passe ne correspondent pas.'
        elif len(password) < 8:
            error = 'Mot de passe trop court (8 caractères minimum).'
        else:
            with _get_conn() as conn:
                # Vérifier pseudo
                taken = conn.execute(
                    db.text("SELECT COUNT(*) FROM accounts WHERE name = :n"), {'n': username}
                ).fetchone()[0]
                if taken:
                    error = 'Ce pseudo est déjà utilisé.'
                else:
                    # Vérifier play key
                    key_row = conn.execute(
                        db.text("SELECT id, key_uses FROM play_keys WHERE key_string = :k AND active = 1"),
                        {'k': key_str}
                    ).fetchone()
                    if not key_row or key_row[1] == 0:
                        error = 'Clé d\'accès invalide ou épuisée.'
                    else:
                        # Hash bcrypt compatible DarkflameServer ($2a$)
                        pw_hash = hashpw(password.encode(), gensalt(prefix=b'2a')).decode()
                        # Créer le compte dans la table DarkflameServer
                        conn.execute(
                            db.text("INSERT INTO accounts (name, password, play_key_id) VALUES (:n, :p, :k)"),
                            {'n': username, 'p': pw_hash, 'k': key_row[0]}
                        )
                        # Décrémenter key_uses
                        conn.execute(
                            db.text("UPDATE play_keys SET key_uses = key_uses - 1 WHERE id = :id"),
                            {'id': key_row[0]}
                        )
                        conn.commit()
                        flash('Compte créé avec succès ! Connectez-vous.', 'success')
                        return redirect(url_for('accounts.login'))
    return render_template('panel/register.html', error=error)


@accounts_bp.route('/dashboard')
@login_required
def dashboard():
    with _get_conn() as conn:
        characters = conn.execute(
            db.text("SELECT id, name, last_zone, last_login FROM charinfo WHERE account_id = :aid ORDER BY last_login DESC"),
            {'aid': current_user.id}
        ).fetchall()
    chars = [{
        'id': c[0], 'name': c[1],
        'zone': ZONE_NAMES.get(c[2], f'Zone {c[2]}'),
        'last_login': c[3]
    } for c in characters]
    return render_template('panel/dashboard.html', characters=chars)


@accounts_bp.route('/data-download', methods=['GET', 'POST'])
@login_required
def data_download():
    error = None
    if request.method == 'POST':
        char_name = request.form.get('character_name', '').strip()
        with _get_conn() as conn:
            char = conn.execute(
                db.text("SELECT id FROM charinfo WHERE name = :n AND account_id = :aid"),
                {'n': char_name, 'aid': current_user.id}
            ).fetchone()
            if not char:
                error = f'Personnage "{char_name}" introuvable.'
            else:
                xml = conn.execute(
                    db.text("SELECT xml_data FROM charxml WHERE id = :id"),
                    {'id': char[0]}
                ).fetchone()
                if not xml:
                    error = 'Aucune donnée XML pour ce personnage.'
                else:
                    return Response(
                        xml[0], mimetype='text/xml',
                        headers={'Content-Disposition': f'attachment; filename={char_name}.xml'}
                    )
    return render_template('panel/data_download.html', error=error)


@accounts_bp.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    error = None
    success = None
    if request.method == 'POST':
        current_pw = request.form.get('current_password', '')
        new_pw     = request.form.get('new_password', '')
        confirm_pw = request.form.get('confirm_password', '')
        with _get_conn() as conn:
            row = conn.execute(
                db.text("SELECT password FROM accounts WHERE id = :id"), {'id': current_user.id}
            ).fetchone()
        try:
            valid = checkpw(current_pw.encode(), row[0].encode())
        except Exception:
            valid = False
        if not valid:
            error = 'Mot de passe actuel incorrect.'
        elif len(new_pw) < 8:
            error = 'Nouveau mot de passe trop court.'
        elif new_pw != confirm_pw:
            error = 'Les mots de passe ne correspondent pas.'
        else:
            new_hash = hashpw(new_pw.encode(), gensalt(prefix=b'2a')).decode()
            with _get_conn() as conn:
                conn.execute(
                    db.text("UPDATE accounts SET password = :p WHERE id = :id"),
                    {'p': new_hash, 'id': current_user.id}
                )
                conn.commit()
            success = 'Mot de passe mis à jour !'
    return render_template('panel/settings.html', error=error, success=success)


@accounts_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Déconnecté.', 'info')
    return redirect(url_for('vitrine.index'))
