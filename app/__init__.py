from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from config import config

db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
migrate = Migrate()
csrf = CSRFProtect()


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Init extensions
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    login_manager.login_view = 'accounts.login'
    login_manager.login_message = 'Veuillez vous connecter pour accéder à cette page.'
    login_manager.login_message_category = 'warning'

    # Blueprints
    from app.vitrine import vitrine_bp
    from app.accounts import accounts_bp
    from app.characters import characters_bp
    from app.play_keys import play_keys_bp
    from app.moderation import moderation_bp
    from app.admin import admin_bp
    from app.api import api_bp
    from app.news import news_bp

    app.register_blueprint(vitrine_bp)
    app.register_blueprint(accounts_bp, url_prefix='/auth')
    app.register_blueprint(characters_bp, url_prefix='/characters')
    app.register_blueprint(play_keys_bp, url_prefix='/play-keys')
    app.register_blueprint(moderation_bp, url_prefix='/moderation')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(news_bp, url_prefix='/news')

    return app
