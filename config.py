import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-CHANGE-ME')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = True
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    UPLOAD_FOLDER = 'app/static/uploads'

    # Base principale Universe Reborn (tables ur_*)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://ur_user:ur_password@localhost:3306/universe_reborn'
    )

    # Base DarkflameServer (lecture seule — tables accounts, charinfo, charxml...)
    # Mettre la même URL que DATABASE_URL si les deux BDD sont dans le même serveur MySQL
    # ou une URL séparée si DarkflameServer utilise une BDD différente.
    SQLALCHEMY_BINDS = {
        'darkflame': os.environ.get(
            'DARKFLAME_DATABASE_URL',
            'mysql+pymysql://df_user:df_password@localhost:3306/darkflame'
        )
    }


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///universe_reborn_dev.db'
    )
    SQLALCHEMY_BINDS = {
        'darkflame': os.environ.get(
            'DARKFLAME_DATABASE_URL',
            'sqlite:///darkflame_dev.db'
        )
    }
    # En dev, désactiver CSRF si besoin
    # WTF_CSRF_ENABLED = False


class ProductionConfig(BaseConfig):
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = True


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_BINDS = {'darkflame': 'sqlite:///:memory:'}
    WTF_CSRF_ENABLED = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}


def get_config(env=None):
    env = env or os.environ.get('FLASK_ENV', 'production')
    return config.get(env, config['default'])
