from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.models import PlayKey

play_keys_bp = Blueprint('play_keys', __name__)


@play_keys_bp.route('/')
@login_required
def index():
    if not current_user.is_admin:
        from flask import abort
        abort(403)
    keys = PlayKey.query.order_by(PlayKey.created_at.desc()).all()
    return render_template('panel/admin/play_keys.html', keys=keys)
