# =============================================================
#  Universe Reborn — Mail Blueprint
#  - Reset de mot de passe par email
#  - Envoi de mails in-game (insère dans table `mail` DarkflameServer)
# =============================================================
import os
import secrets
import smtplib
import time
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import (
    Blueprint, render_template, redirect, url_for,
    flash, request, current_app, abort
)
from flask_login import login_required, current_user
from bcrypt import hashpw, gensalt

from app import db
from app.models import PasswordResetToken, InGameMail, AuditLog

mail_bp = Blueprint('mail', __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def log_audit(action: str):
    """Enregistre une action dans le journal d'audit."""
    try:
        if current_user and current_user.is_authenticated:
            db.session.add(AuditLog(
                account_id=current_user.id,
                username=current_user.username,
                action=action
            ))
            db.session.commit()
    except Exception as e:
        current_app.logger.error(f'Audit log error: {e}')


def send_email(to_addr: str, subject: str, body_html: str, body_text: str = '') -> bool:
    """
    Envoie un email via SMTP.
    Variables d'env requises : MAIL_SERVER, MAIL_PORT, MAIL_USERNAME,
                               MAIL_PASSWORD, MAIL_USE_TLS, MAIL_FROM
    Retourne True si succès.
    """
    mail_server = os.environ.get('MAIL_SERVER', '')
    mail_port = int(os.environ.get('MAIL_PORT', 587))
    mail_user = os.environ.get('MAIL_USERNAME', '')
    mail_pass = os.environ.get('MAIL_PASSWORD', '')
    mail_from = os.environ.get('MAIL_FROM', mail_user)
    use_tls = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'

    if not mail_server or not mail_user:
        current_app.logger.warning('MAIL_SERVER/MAIL_USERNAME non configuré — email non envoyé.')
        return False

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = mail_from
    msg['To'] = to_addr

    if body_text:
        msg.attach(MIMEText(body_text, 'plain', 'utf-8'))
    msg.attach(MIMEText(body_html, 'html', 'utf-8'))

    try:
        if use_tls:
            server = smtplib.SMTP(mail_server, mail_port)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(mail_server, mail_port)
        server.login(mail_user, mail_pass)
        server.sendmail(mail_from, [to_addr], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        current_app.logger.error(f'Erreur SMTP : {e}')
        return False


# ---------------------------------------------------------------------------
# Reset de mot de passe
# ---------------------------------------------------------------------------

@mail_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Formulaire de demande de réinitialisation."""
    error = None
    success = None

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email_input = request.form.get('email', '').strip().lower()

        with db.engine.connect() as conn:
            row = conn.execute(
                db.text("SELECT id, email FROM accounts WHERE name = :n"),
                {'n': username}
            ).fetchone()

        if row and row[1] and row[1].strip().lower() == email_input:
            # Invalider anciens tokens
            PasswordResetToken.query.filter_by(
                account_id=row[0], used=False
            ).update({'used': True})
            db.session.commit()

            token = secrets.token_urlsafe(48)
            expires = datetime.utcnow() + timedelta(hours=2)
            db.session.add(PasswordResetToken(
                account_id=row[0],
                token=token,
                expires_at=expires
            ))
            db.session.commit()

            reset_link = url_for('mail.reset_password', token=token, _external=True)
            body_html = render_template(
                'mail/reset_password_email.html',
                reset_link=reset_link,
                username=username
            )
            send_email(
                to_addr=email_input,
                subject='[Universe Reborn] Réinitialisation de mot de passe',
                body_html=body_html,
                body_text=f'Lien de réinitialisation (valable 2h) : {reset_link}'
            )

        # Toujours afficher le même message (ne pas révéler l'existence du compte)
        success = "Si ce compte existe et que l'email correspond, un lien a été envoyé."

    return render_template('panel/forgot_password.html', error=error, success=success)


@mail_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    """Page de reset avec validation du token."""
    record = PasswordResetToken.query.filter_by(token=token, used=False).first()

    if not record or record.expires_at < datetime.utcnow():
        flash('Lien invalide ou expiré.', 'danger')
        return redirect(url_for('accounts.login'))

    error = None

    if request.method == 'POST':
        new_pw = request.form.get('new_password', '')
        confirm = request.form.get('confirm_password', '')

        if len(new_pw) < 8:
            error = 'Mot de passe trop court (8 caractères minimum).'
        elif new_pw != confirm:
            error = 'Les mots de passe ne correspondent pas.'
        else:
            pw_hash = hashpw(new_pw.encode(), gensalt(prefix=b'2a')).decode()
            with db.engine.connect() as conn:
                conn.execute(
                    db.text("UPDATE accounts SET password = :p WHERE id = :id"),
                    {'p': pw_hash, 'id': record.account_id}
                )
                conn.commit()
            record.used = True
            db.session.commit()
            flash('Mot de passe réinitialisé avec succès !', 'success')
            return redirect(url_for('accounts.login'))

    return render_template('panel/reset_password.html', token=token, error=error)


# ---------------------------------------------------------------------------
# Mail in-game (admin / mod GM ≥ 3)
# ---------------------------------------------------------------------------

@mail_bp.route('/send-ingame', methods=['GET', 'POST'])
@login_required
def send_ingame_mail():
    """Envoie un mail in-game à un personnage via la table `mail` DFS."""
    if not current_user.is_mod:
        abort(403)

    error = None
    success = None

    if request.method == 'POST':
        char_name = request.form.get('character_name', '').strip()
        subject = request.form.get('subject', '').strip()
        body = request.form.get('body', '').strip()
        attachment_lot_raw = request.form.get('attachment_lot', '').strip()
        attachment_count_raw = request.form.get('attachment_count', '1').strip()

        if not char_name or not subject or not body:
            error = 'Destinataire, sujet et corps du message sont obligatoires.'
        else:
            with db.engine.connect() as conn:
                char = conn.execute(
                    db.text("SELECT id FROM charinfo WHERE name = :n"),
                    {'n': char_name}
                ).fetchone()

            if not char:
                error = f'Personnage "{char_name}" introuvable.'
            else:
                char_id = char[0]
                lot = int(attachment_lot_raw) if attachment_lot_raw.isdigit() else -1
                count = int(attachment_count_raw) if attachment_count_raw.isdigit() else 1
                expire_ts = int(time.time()) + 60 * 60 * 24 * 30  # 30 jours

                try:
                    with db.engine.connect() as conn:
                        conn.execute(
                            db.text("""
                                INSERT INTO mail
                                (sender_id, sender_name, receiver_id, receiver_name,
                                 time_sent, subject, body,
                                 attachment_id, attachment_lot, attachment_count,
                                 attachment_subtotal, expiration_time, was_read)
                                VALUES
                                (0, :sn, :rid, :rn, :ts, :sub, :body,
                                 0, :lot, :cnt, 0, :exp, 0)
                            """),
                            {
                                'sn': current_user.username,
                                'rid': char_id, 'rn': char_name,
                                'ts': int(time.time()),
                                'sub': subject, 'body': body,
                                'lot': lot, 'cnt': count, 'exp': expire_ts
                            }
                        )
                        conn.commit()

                    db.session.add(InGameMail(
                        sender_account_id=current_user.id,
                        sender_name=current_user.username,
                        receiver_char_id=char_id,
                        receiver_name=char_name,
                        subject=subject, body=body,
                        attachment_lot=lot if lot != -1 else None,
                        attachment_count=count if lot != -1 else None
                    ))
                    db.session.commit()
                    log_audit(f'Mail in-game envoyé à {char_name} — sujet: {subject}')
                    success = f'Mail envoyé à {char_name} avec succès !'

                except Exception as e:
                    error = f'Erreur lors de l\'envoi : {e}'

    return render_template('panel/send_ingame_mail.html', error=error, success=success)


@mail_bp.route('/ingame-log')
@login_required
def ingame_mail_log():
    """Historique des mails in-game envoyés depuis le panel."""
    if not current_user.is_mod:
        abort(403)
    page = request.args.get('page', 1, type=int)
    per_page = 25
    total = InGameMail.query.count()
    logs = InGameMail.query.order_by(InGameMail.sent_at.desc())\
        .offset((page - 1) * per_page).limit(per_page).all()
    return render_template(
        'panel/ingame_mail_log.html',
        logs=logs, page=page, total=total, per_page=per_page
    )
