import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_migrate import Migrate
from config import get_config

db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()
migrate = Migrate()

login_manager.login_view = 'accounts.login'
login_manager.login_message = 'Connectez-vous pour accéder à cette page.'
login_manager.login_message_category = 'warning'


def create_app(env=None):
    app = Flask(__name__)
    app.config.from_object(get_config(env))

    # Extensions
    db.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)
    migrate.init_app(app, db)

    # Dossier uploads
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'app/static/uploads'), exist_ok=True)
    os.makedirs('app/static/downloads', exist_ok=True)

    # Blueprints
    from app.vitrine import vitrine_bp
    from app.accounts import accounts_bp
    from app.admin import admin_bp
    from app.news import news_bp
    from app.api import api_bp
    from app.characters import characters_bp
    from app.moderation import moderation_bp
    from app.play_keys import play_keys_bp

    app.register_blueprint(vitrine_bp)
    app.register_blueprint(accounts_bp, url_prefix='/panel')
    app.register_blueprint(admin_bp, url_prefix='/panel/admin')
    app.register_blueprint(news_bp, url_prefix='/news')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(characters_bp, url_prefix='/panel/characters')
    app.register_blueprint(moderation_bp, url_prefix='/panel')
    app.register_blueprint(play_keys_bp, url_prefix='/panel/play-keys')

    # Filtres Jinja2
    @app.template_filter('format_number')
    def format_number(value):
        try:
            return '{:,}'.format(int(value)).replace(',', ' ')
        except (ValueError, TypeError):
            return value

    @app.template_filter('playtime')
    def playtime_filter(minutes):
        try:
            m = int(minutes)
            h = m // 60
            mins = m % 60
            return f'{h}h {mins:02d}min'
        except:
            return '0h 00min'

    # Erreurs
    @app.errorhandler(404)
    def not_found(e):
        from flask import render_template
        return render_template('errors/404.html'), 404

    @app.errorhandler(403)
    def forbidden(e):
        from flask import render_template
        return render_template('errors/403.html'), 403

    @app.errorhandler(500)
    def server_error(e):
        from flask import render_template
        return render_template('errors/500.html'), 500

    return app
