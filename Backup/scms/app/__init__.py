from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_talisman import Talisman
from flask_ldap3_login import LDAP3LoginManager
from config import Config

db = SQLAlchemy()
migrate = Migrate()
login = LoginManager()
csrf = CSRFProtect()
talisman = Talisman()
ldap_manager = LDAP3LoginManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    login.init_app(app)
    csrf.init_app(app)
    talisman.init_app(app)
    ldap_manager.init_app(app)

    login.login_view = 'main.login'

    @login.user_loader
    def load_user(user_id):
        from app.models import User
        return User.query.get(int(user_id))

    with app.app_context():
        from app.routes import bp as main_bp
        app.register_blueprint(main_bp)

        from app.routes.bookings import bp as bookings_bp
        app.register_blueprint(bookings_bp, url_prefix='/bookings')

    return app