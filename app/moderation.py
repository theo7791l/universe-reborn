from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import db
from app.models import BugReport

moderation_bp = Blueprint('moderation', __name__)


@moderation_bp.route('/report-bug', methods=['GET', 'POST'])
@login_required
def report_bug():
    error = None
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        desc  = request.form.get('description', '').strip()
        if not title or not desc:
            error = 'Titre et description obligatoires.'
        else:
            db.session.add(BugReport(
                account_id=current_user.id,
                reporter_name=current_user.username,
                title=title, description=desc
            ))
            db.session.commit()
            flash('Rapport envoyé, merci !', 'success')
            return redirect(url_for('accounts.dashboard'))
    return render_template('panel/report_bug.html', error=error)
