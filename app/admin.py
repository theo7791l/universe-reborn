from flask import Blueprint, render_template, redirect, url_for, flash, abort
from flask_login import login_required, current_user
from app.models import User, Character, PlayKey, NewsArticle, BugReport
from app import db
import secrets
import string

admin_bp = Blueprint('admin', __name__)


def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/')
@login_required
@admin_required
def index():
    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(is_active=True).count(),
        'banned_users': User.query.filter_by(is_banned=True).count(),
        'total_characters': Character.query.count(),
        'total_articles': NewsArticle.query.count(),
        'open_bug_reports': BugReport.query.filter_by(status='open').count(),
    }
    return render_template('panel/admin/index.html', stats=stats)


@admin_bp.route('/players')
@login_required
@admin_required
def players():
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('panel/admin/players.html', users=users)


@admin_bp.route('/players/<int:user_id>/ban', methods=['POST'])
@login_required
@admin_required
def ban_player(user_id):
    user = User.query.get_or_404(user_id)
    user.is_banned = True
    db.session.commit()
    flash(f'Joueur {user.username} banni.', 'success')
    return redirect(url_for('admin.players'))


@admin_bp.route('/players/<int:user_id>/unban', methods=['POST'])
@login_required
@admin_required
def unban_player(user_id):
    user = User.query.get_or_404(user_id)
    user.is_banned = False
    user.ban_reason = None
    db.session.commit()
    flash(f'Joueur {user.username} débanni.', 'success')
    return redirect(url_for('admin.players'))


@admin_bp.route('/play-keys/generate', methods=['POST'])
@login_required
@admin_required
def generate_play_key():
    alphabet = string.ascii_uppercase + string.digits
    key = '-'.join(''.join(secrets.choice(alphabet) for _ in range(5)) for _ in range(4))
    play_key = PlayKey(key_string=key, created_by=current_user.id)
    db.session.add(play_key)
    db.session.commit()
    flash(f'Clé générée : {key}', 'success')
    return redirect(url_for('admin.index'))
