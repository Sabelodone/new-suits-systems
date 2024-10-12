#app/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_session import Session
from flasgger import Swagger

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
sess = Session()
swagger = Swagger()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # You can update this with your MySQL configuration
    app.config['SECRET_KEY'] = os.urandom(24).hex()
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_TYPE'] = 'filesystem'

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    sess.init_app(app)
    
    # Initialize Swagger with YAML configuration
    swagger = Swagger(app, template_file='swagger.yml')

    # Import models
    from app import models

    # Register Blueprints
    from app.routes.users import users_blueprint  # Import your users blueprint
    app.register_blueprint(users_blueprint, url_prefix='/users')  # Prefix all routes with /users

    #from app.routes.billing import billing_blueprint
    #app.register_blueprint(billing_blueprint, url_prefix='/billing')

    #from app.routes.cases import case_blueprint
    #app.register_blueprint(case_blueprint, url_prefix='/cases')

    from app.routes.customers import customers_blueprint
    app.register_blueprint(customers_blueprint, url_prefix='/customers')

    from app.routes.documents import documents_blueprint
    app.register_blueprint(documents_blueprint, url_prefix='/documents')

    from app.routes.invoices import invoices_blueprint
    app.register_blueprint(invoices_blueprint, url_prefix='/invoices')

    from app.routes.payments import payments_blueprint
    app.register_blueprint(payments_blueprint, url_prefix='/payments')

    from app.routes.tasks import tasks_blueprint
    app.register_blueprint(tasks_blueprint, url_prefix='/tasks')

    # Set login manager login view
    login_manager.login_view = 'users.login'

    # user loader callback for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return models.User.query.get(int(user_id))

    return app

