from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from app import db
from app.models import User, PlayKey

accounts_bp = Blueprint('accounts', __name__)


@accounts_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('accounts.dashboard'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember') == 'on'
        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            error = 'Identifiants incorrects.'
        elif user.is_banned:
            error = f'Compte banni. Raison : {user.ban_reason or "Non précisée"}'
        else:
            user.last_login = datetime.utcnow()
            db.session.commit()
            login_user(user, remember=remember)
            flash('Bienvenue, ' + user.username + ' !', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('accounts.dashboard'))
    return render_template('panel/login.html', error=error)


@accounts_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('accounts.dashboard'))
    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')
        play_key_str = request.form.get('play_key', '').strip().upper()

        if len(username) < 3 or len(username) > 32:
            error = 'Le pseudo doit faire entre 3 et 32 caractères.'
        elif password != confirm:
            error = 'Les mots de passe ne correspondent pas.'
        elif len(password) < 8:
            error = 'Le mot de passe doit faire au moins 8 caractères.'
        elif User.query.filter_by(username=username).first():
            error = 'Ce pseudo est déjà utilisé.'
        elif User.query.filter_by(email=email).first():
            error = 'Cet email est déjà utilisé.'
        else:
            # Vérification Play Key
            play_key = PlayKey.query.filter_by(
                key_string=play_key_str, is_active=True
            ).first()
            if not play_key or play_key.uses_remaining <= 0:
                error = 'Clé d\'accès invalide ou épuisée. Rejoignez notre Discord pour en obtenir une.'
            else:
                user = User(
                    username=username,
                    email=email,
                    play_key_id=play_key.id
                )
                user.set_password(password)
                play_key.use()
                db.session.add(user)
                db.session.commit()
                login_user(user)
                flash('Compte créé avec succès ! Bienvenue sur Universe Reborn.', 'success')
                return redirect(url_for('accounts.dashboard'))
    return render_template('panel/register.html', error=error)


@accounts_bp.route('/dashboard')
@login_required
def dashboard():
    characters = current_user.get_darkflame_characters()
    return render_template('panel/dashboard.html', characters=characters)


@accounts_bp.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    error = None
    success = None
    if request.method == 'POST':
        current_pw = request.form.get('current_password', '')
        new_pw = request.form.get('new_password', '')
        confirm_pw = request.form.get('confirm_password', '')
        if not current_user.check_password(current_pw):
            error = 'Mot de passe actuel incorrect.'
        elif len(new_pw) < 8:
            error = 'Le nouveau mot de passe doit faire au moins 8 caractères.'
        elif new_pw != confirm_pw:
            error = 'Les nouveaux mots de passe ne correspondent pas.'
        else:
            current_user.set_password(new_pw)
            db.session.commit()
            success = 'Mot de passe mis à jour avec succès.'
    return render_template('panel/settings.html', error=error, success=success)


@accounts_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Déconnecté avec succès.', 'info')
    return redirect(url_for('vitrine.index'))
