import uuid
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(UserMixin, db.Model):
    """
    Table des comptes Universe Reborn.
    Liée à la table `accounts` de DarkflameServer via `darkflame_account_id`.
    """
    __tablename__ = 'ur_users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)

    # Lien vers le compte DarkflameServer (table `accounts`)
    darkflame_account_id = db.Column(db.Integer, nullable=True, index=True)

    # Rôles
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_moderator = db.Column(db.Boolean, default=False, nullable=False)
    is_banned = db.Column(db.Boolean, default=False, nullable=False)
    ban_reason = db.Column(db.String(256), nullable=True)
    email_confirmed = db.Column(db.Boolean, default=False, nullable=False)

    # Discord OAuth2
    discord_id = db.Column(db.String(64), unique=True, nullable=True)
    discord_username = db.Column(db.String(64), nullable=True)

    # Play Key liée à ce compte
    play_key_id = db.Column(db.Integer, db.ForeignKey('ur_play_keys.id'), nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)

    # Relations
    articles = db.relationship('NewsArticle', backref='author', lazy='dynamic',
                               foreign_keys='NewsArticle.author_id')
    bug_reports = db.relationship('BugReport', backref='reporter', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_active(self):
        return not self.is_banned

    def get_darkflame_characters(self):
        """Retourne les personnages depuis la DB DarkflameServer."""
        if self.darkflame_account_id:
            return DFCharacter.query.filter_by(account_id=self.darkflame_account_id).all()
        return []

    def __repr__(self):
        return f'<User {self.username}>'


class PlayKey(db.Model):
    """
    Clés d'accès pour s'inscrire. Correspond à la table `play_keys` de DarkflameServer.
    """
    __tablename__ = 'ur_play_keys'

    id = db.Column(db.Integer, primary_key=True)
    key_string = db.Column(db.String(64), unique=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    uses_total = db.Column(db.Integer, default=1)
    uses_remaining = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('ur_users.id'), nullable=True)
    notes = db.Column(db.String(256), nullable=True)

    users = db.relationship('User', backref='play_key', lazy='dynamic',
                            foreign_keys='User.play_key_id')

    @staticmethod
    def generate():
        return str(uuid.uuid4()).upper()[:19].replace('-', '-')

    def use(self):
        if self.uses_remaining > 0:
            self.uses_remaining -= 1
            if self.uses_remaining == 0:
                self.is_active = False
            return True
        return False

    def __repr__(self):
        return f'<PlayKey {self.key_string}>'


class NewsArticle(db.Model):
    __tablename__ = 'ur_news'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500), nullable=True)
    cover_image = db.Column(db.String(256), nullable=True)
    category = db.Column(db.String(64), default='Actualité')
    author_id = db.Column(db.Integer, db.ForeignKey('ur_users.id'), nullable=False)
    is_published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<NewsArticle {self.title}>'


class BugReport(db.Model):
    __tablename__ = 'ur_bug_reports'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('ur_users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), default='open')  # open, in_progress, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<BugReport {self.title}>'


# ================================================================
# MODÈLES READ-ONLY liés à la base DarkflameServer
# Ces tables sont gérées par DarkflameServer, on les lit seulement.
# ================================================================

class DFAccount(db.Model):
    """
    Table `accounts` de DarkflameServer — lecture seule.
    Permet de lier un compte UR à un compte jeu.
    """
    __tablename__ = 'accounts'
    __bind_key__ = 'darkflame'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    password = db.Column(db.String(256))
    play_key_id = db.Column(db.Integer)
    gm_level = db.Column(db.Integer, default=0)
    locked = db.Column(db.Boolean, default=False)
    banned = db.Column(db.Boolean, default=False)
    ban_reason = db.Column(db.String(256))
    created_at = db.Column(db.DateTime)
    last_login = db.Column(db.DateTime)


class DFCharacter(db.Model):
    """
    Table `charinfo` de DarkflameServer — lecture seule.
    """
    __tablename__ = 'charinfo'
    __bind_key__ = 'darkflame'

    id = db.Column(db.BigInteger, primary_key=True)  # object_id LEGO Universe
    account_id = db.Column(db.Integer, index=True)
    name = db.Column(db.String(64))
    pending_name = db.Column(db.String(64))
    needs_rename = db.Column(db.Boolean, default=False)
    prop_clone_id = db.Column(db.Integer, default=0)
    last_zone = db.Column(db.Integer, default=0)
    last_instance = db.Column(db.Integer, default=0)
    last_clone = db.Column(db.Integer, default=0)
    last_login = db.Column(db.DateTime)
    permission_map = db.Column(db.BigInteger, default=0)

    @property
    def zone_name(self):
        zones = {
            0: 'Aucune', 1000: 'Venture Explorer', 1100: 'Avant Gardens',
            1101: 'AG Survival', 1102: 'Spider Queen Battle', 1200: 'Nimbus Station',
            1201: 'Pet Cove', 1203: 'Vertigo Loop Racetrack', 1204: 'Battle of Nimbus Station',
            1300: 'Gnarled Forest', 1302: 'Cannon Cove Shooting Gallery',
            1303: 'Keelhaul Canyon', 1400: 'Forbidden Valley', 1402: 'Forbidden Valley Dragon',
            1403: 'Ninja Brawlplex', 1600: 'Nexus Tower', 1700: 'Ninjago Monastery',
            1800: 'Crux Prime'
        }
        return zones.get(self.last_zone, f'Zone {self.last_zone}')


class DFCharacterStats(db.Model):
    """
    Table `charxml` ou stats extraites — lecture seule.
    Contient level, currency, universe_score etc.
    """
    __tablename__ = 'charxml'
    __bind_key__ = 'darkflame'

    id = db.Column(db.BigInteger, db.ForeignKey('charinfo.id'), primary_key=True)
    xml_data = db.Column(db.Text)  # XML brut du personnage DarkflameServer
