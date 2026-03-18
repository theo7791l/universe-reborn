from flask import Blueprint, render_template, abort
from flask_login import login_required, current_user
from app.models import Character

characters_bp = Blueprint('characters', __name__)


@characters_bp.route('/<int:char_id>')
@login_required
def detail(char_id):
    character = Character.query.get_or_404(char_id)
    if character.user_id != current_user.id and not current_user.is_admin:
        abort(403)
    return render_template('panel/character.html', character=character)
