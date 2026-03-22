# =============================================================
#  Universe Reborn — Models
#  Tables ur_* (site) + helpers DarkflameServer
# =============================================================
from datetime import datetime
from flask_login import UserMixin
from app import db, login_manager


# ---------------------------------------------------------------------------
# USER MODEL (pas de table séparée — utilise accounts DFS)
# ---------------------------------------------------------------------------
class UserModel(UserMixin):
    def __init__(self, id, username, gm_level):
        self.id       = id
        self.username = username
        self.gm_level = gm_level

    def get_id(self):
        return str(self.id)

    @property
    def is_admin(self):
        return self.gm_level >= 9

    @property
    def is_mod(self):
        return self.gm_level >= 4

    def __repr__(self):
        return f'<User {self.username} GM{self.gm_level}>'


@login_manager.user_loader
def load_user(user_id):
    result = db.engine.execute(
        db.text("SELECT id, name, gm_level FROM accounts WHERE id = :id"),
        {'id': int(user_id)}
    ).fetchone()
    if result is None:
        return None
    return UserModel(result[0], result[1], result[2])


# ---------------------------------------------------------------------------
# ZONE METADATA
# ---------------------------------------------------------------------------
ZONE_NAMES = {
    0: 'Aucune', 1000: 'Venture Explorer', 1100: 'Avant Gardens',
    1101: 'AG Survival', 1102: 'Spider Queen Battle',
    1200: 'Nimbus Station', 1201: 'Pet Cove',
    1203: 'Vertigo Loop Racetrack', 1204: 'Battle of Nimbus Station',
    1300: 'Gnarled Forest', 1302: 'Cannon Cove Shooting Gallery',
    1303: 'Keelhaul Canyon', 1400: 'Forbidden Valley',
    1402: 'Forbidden Valley Dragon', 1403: 'Ninja Brawlplex',
    1600: 'Nexus Tower', 1700: 'Ninjago Monastery', 1800: 'Crux Prime'
}

ZONE_COLORS = {
    1000: 'rgba(200,200,200,1)', 1100: 'rgba(0,255,100,1)',
    1200: 'rgba(54,162,235,1)', 1300: 'rgba(255,99,132,1)',
    1400: 'rgba(153,102,255,1)', 1600: 'rgba(255,204,0,1)',
    1700: 'rgba(75,192,192,1)', 1800: 'rgba(102,0,204,1)',
}


# ---------------------------------------------------------------------------
# TABLES SITE (ur_*)
# ---------------------------------------------------------------------------
class NewsArticle(db.Model):
    __tablename__ = 'ur_news'
    id           = db.Column(db.Integer, primary_key=True)
    title        = db.Column(db.String(200), nullable=False)
    slug         = db.Column(db.String(200), unique=True, nullable=False, index=True)
    content      = db.Column(db.Text, nullable=False)
    excerpt      = db.Column(db.String(500), nullable=True)
    cover_image  = db.Column(db.String(256), nullable=True)
    category     = db.Column(db.String(64), default='Actualité')
    author_name  = db.Column(db.String(64), nullable=False, default='Admin')
    is_published = db.Column(db.Boolean, default=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime, nullable=True)


class BugReport(db.Model):
    __tablename__ = 'ur_bug_reports'
    id            = db.Column(db.Integer, primary_key=True)
    account_id    = db.Column(db.Integer, nullable=False, index=True)
    reporter_name = db.Column(db.String(64), nullable=False)
    title         = db.Column(db.String(200), nullable=False)
    description   = db.Column(db.Text, nullable=False)
    status        = db.Column(db.String(32), default='open')  # open | in_progress | closed
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(db.Model):
    """Historique de toutes les actions admin/modération."""
    __tablename__ = 'ur_audit_log'
    id          = db.Column(db.Integer, primary_key=True)
    actor_id    = db.Column(db.Integer, nullable=False, index=True)  # account.id de l'admin
    action      = db.Column(db.String(64), nullable=False)           # ban, rescue, send_mail…
    target_type = db.Column(db.String(32), nullable=True)            # account | character | property…
    target_id   = db.Column(db.Integer, nullable=True)
    detail      = db.Column(db.String(512), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    @classmethod
    def log(cls, actor_id, action, target_type=None, target_id=None, detail=None):
        """Helper pour créer une entrée d'audit en une ligne."""
        try:
            entry = cls(
                actor_id=actor_id, action=action,
                target_type=target_type, target_id=target_id,
                detail=detail
            )
            db.session.add(entry)
            db.session.commit()
        except Exception:
            db.session.rollback()
