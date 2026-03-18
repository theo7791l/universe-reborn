from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.models import BugReport
from app import db

moderation_bp = Blueprint('moderation', __name__)


@moderation_bp.route('/report', methods=['GET', 'POST'])
@login_required
def report_bug():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        report = BugReport(
            user_id=current_user.id,
            title=title,
            description=description
        )
        db.session.add(report)
        db.session.commit()
        flash('Rapport envoyé avec succès !', 'success')
        return redirect(url_for('accounts.dashboard'))
    return render_template('panel/report_bug.html')
