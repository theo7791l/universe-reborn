from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import User, PlayKey
from app import db
from datetime import datetime

accounts_bp = Blueprint('accounts', __name__)


@accounts_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('accounts.dashboard'))
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember', False)
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            if user.is_banned:
                flash(f'Votre compte est banni. Raison : {user.ban_reason}', 'danger')
                return redirect(url_for('accounts.login'))
            login_user(user, remember=bool(remember))
            user.last_login = datetime.utcnow()
            db.session.commit()
            return redirect(url_for('accounts.dashboard'))
        flash('Identifiants incorrects.', 'danger')
    return render_template('panel/login.html')


@accounts_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('accounts.dashboard'))
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        play_key_str = request.form.get('play_key')

        if password != confirm_password:
            flash('Les mots de passe ne correspondent pas.', 'danger')
            return redirect(url_for('accounts.register'))

        if User.query.filter_by(username=username).first():
            flash('Ce pseudo est déjà utilisé.', 'danger')
            return redirect(url_for('accounts.register'))

        if User.query.filter_by(email=email).first():
            flash('Cet email est déjà utilisé.', 'danger')
            return redirect(url_for('accounts.register'))

        play_key = PlayKey.query.filter_by(
            key_string=play_key_str, is_active=True
        ).first()

        if not play_key or play_key.uses_remaining <= 0:
            flash('Clé de jeu invalide ou expirée.', 'danger')
            return redirect(url_for('accounts.register'))

        user = User(username=username, email=email)
        user.set_password(password)
        user.play_key_id = play_key.id
        play_key.uses_remaining -= 1
        if play_key.uses_remaining <= 0:
            play_key.is_active = False

        db.session.add(user)
        db.session.commit()
        flash('Compte créé avec succès ! Vous pouvez vous connecter.', 'success')
        return redirect(url_for('accounts.login'))
    return render_template('panel/register.html')


@accounts_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Vous avez été déconnecté.', 'info')
    return redirect(url_for('vitrine.index'))


@accounts_bp.route('/dashboard')
@login_required
def dashboard():
    characters = current_user.characters.filter_by(is_active=True).all()
    return render_template('panel/dashboard.html', characters=characters)


@accounts_bp.route('/settings')
@login_required
def settings():
    return render_template('panel/settings.html')
