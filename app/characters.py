from flask import Blueprint, render_template, abort
from flask_login import login_required, current_user
from app.models import DFCharacter

characters_bp = Blueprint('characters', __name__)


@characters_bp.route('/<int:char_id>')
@login_required
def detail(char_id):
    char = DFCharacter.query.get_or_404(char_id)
    # Sécurité : le personnage doit appartenir au compte DarkflameServer lié
    if char.account_id != current_user.darkflame_account_id:
        abort(403)
    return render_template('panel/character.html', character=char)
