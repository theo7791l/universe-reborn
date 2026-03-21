# =============================================================
#  Universe Reborn — Models
#  Tables ur_* = site Universe Reborn
#  Tables DarkflameServer = accès direct via db.engine
# =============================================================
from datetime import datetime
from flask_login import UserMixin
from app import db, login_manager


# ---------------------------------------------------------------------------
# USER MODEL (in-memory, pas de table séparée)
# ---------------------------------------------------------------------------
class UserModel(UserMixin):
    def __init__(self, id, username, gm_level):
        self.id = id
        self.username = username
        self.gm_level = gm_level

    def get_id(self):
        return str(self.id)

    @property
    def is_admin(self):
        return self.gm_level >= 9

    @property
    def is_mod(self):
        return self.gm_level >= 3

    def __repr__(self):
        return f'<User {self.username} GM{self.gm_level}>'


@login_manager.user_loader
def load_user(user_id):
    try:
        with db.engine.connect() as conn:
            result = conn.execute(
                db.text("SELECT id, name, gm_level FROM accounts WHERE id = :id"),
                {'id': int(user_id)}
            ).fetchone()
        if result is None:
            return None
        return UserModel(result[0], result[1], result[2])
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Noms de zones DarkflameServer
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

INVENTORY_NAMES = {
    '0': 'Items',
    '1': 'Currency',
    '2': 'Bricks',
    '4': 'Models / Behaviors',
    '5': 'Properties',
    '6': 'Bricks in BBB',
    '7': 'Temp items',
    '8': 'Quetes',
    '9': 'Donation',
}


# ---------------------------------------------------------------------------
# TABLES SITE (ur_*)
# ---------------------------------------------------------------------------
class NewsArticle(db.Model):
    __tablename__ = 'ur_news'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500), nullable=True)
    cover_image = db.Column(db.String(256), nullable=True)
    category = db.Column(db.String(64), default='Actualite')
    author_name = db.Column(db.String(64), nullable=False, default='Admin')
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime, nullable=True)


class BugReport(db.Model):
    __tablename__ = 'ur_bug_reports'
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, nullable=False, index=True)
    reporter_name = db.Column(db.String(64), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), default='open')  # open / in_progress / closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(db.Model):
    """Journal d'audit des actions admin/mod."""
    __tablename__ = 'ur_audit_log'
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, nullable=False, index=True)
    username = db.Column(db.String(64), nullable=False)
    action = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PetName(db.Model):
    """Noms de pets en attente de moderation (miroir de pet_names DarkflameServer)."""
    __tablename__ = 'ur_pet_names'
    id = db.Column(db.Integer, primary_key=True)  # = id dans pet_names DFS
    pet_name = db.Column(db.String(64), nullable=False)
    owner_char_id = db.Column(db.Integer, nullable=True, index=True)
    # approved: 0=rejected, 1=pending, 2=approved
    approved = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PasswordResetToken(db.Model):
    """Tokens de reinitialisation de mot de passe."""
    __tablename__ = 'ur_password_resets'
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, nullable=False, index=True)
    token = db.Column(db.String(128), nullable=False, unique=True, index=True)
    used = db.Column(db.Boolean, default=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
