#app/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_session import Session
from flasgger import Swagger
from flask_cors import CORS
from flask_migrate import Migrate

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
sess = Session()
migrate = Migrate()
swagger = Swagger()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(__file__), 'app.db')  # You can update this with your MySQL configuration
    app.config['SECRET_KEY'] = os.urandom(24).hex()
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_TYPE'] = 'filesystem'

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    sess.init_app(app)

    #Initialize CORS, allow requests from react app
    CORS(app, supports_credentials=True) # Allow credentials if needed
    app.config['CORS_HEADERS'] = 'Content-Type' # Specify allowed headers
    
    # Initialize Swagger with YAML configuration
    swagger = Swagger(app, template_file='swagger.yml')

    # Import models
    with app.app_context():
        from app import models

    # Register Blueprints
    from app.routes.users import users_blueprint  # Import your users blueprint
    app.register_blueprint(users_blueprint, url_prefix='/api/users')  # Prefix all routes with /users

    #from app.routes.billing import billing_blueprint
    #app.register_blueprint(billing_blueprint, url_prefix='/api/billing')

    from app.routes.cases import cases_blueprint
    app.register_blueprint(cases_blueprint, url_prefix='/api/cases')

    from app.routes.customers import customers_blueprint
    app.register_blueprint(customers_blueprint, url_prefix='/api/customers')

    from app.routes.documents import documents_blueprint
    app.register_blueprint(documents_blueprint, url_prefix='/api/documents')

    from app.routes.invoices import invoices_blueprint
    app.register_blueprint(invoices_blueprint, url_prefix='/api/invoices')

    from app.routes.payments import payments_blueprint
    app.register_blueprint(payments_blueprint, url_prefix='/api/payments')

    from app.routes.tasks import tasks_blueprint
    app.register_blueprint(tasks_blueprint, url_prefix='/api/tasks')

    from app.routes.events import events_blueprint
    app.register_blueprint(events_blueprint, url_prefix='/api/events')

    # Set login manager login view
    login_manager.login_view = 'users.login_user'

    # user loader callback for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return models.User.query.get(int(user_id))

    return app

