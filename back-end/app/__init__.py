#app/__init__.py
import os
from flask import Flask
from config import Config
from flasgger import Swagger
from flask_cors import CORS
from .extentions import db, login_manager, sess, swagger, migration

def create_app():
    app = Flask(__name__)
    # Configurations
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # Set to 10 MB
    app.config.from_object(Config)

    # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # You can update this with your MySQL configuration
    # app.config['SECRET_KEY'] = os.urandom(24).hex()
    # app.config['SESSION_PERMANENT'] = False
    # app.config['SESSION_TYPE'] = 'filesystem'

    # Initialize extensions
    db.init_app(app)
    migration.init_app(app, db)

    login_manager.init_app(app)
    sess.init_app(app)

    #Initialize CORS, allow requests from react app
    CORS(app, supports_credentials=True) # Allow credentials if needed
    app.config['CORS_HEADERS'] = 'Content-Type' # Specify allowed headers
    
    # Initialize Swagger with YAML configuration
    swagger = Swagger(app, template_file='swagger.yml')

    # Import models
    #with app.app_context():
    #    from app import models

    #from app.routes.events import events_blueprint
    #app.register_blueprint(events_blueprint, url_prefix='/api/events')

    from app.models import case, user, gender, lawfirm, client, lawfirm_employee, client_lawfirm, workflow
    from app.models.auth import role, user_role, lawfirm_role, lawfirm_employee_role, token_blocklist
    from app.models.workflow import Workflow
    from app.models.case import Case
    from app.models import task, case_status, case_category, document,document_type
    from app.models.case_category import CaseCategory
    from app.models.case_status import CaseStatus
    from app.models import customer, base_model, primarykey_base_model, phone_number
    from app.models import task_status, document_status, document_history, client_phone
    from app.models.payment import sales_invoice, sales_invoice_item, payment_methods, payment
    
    print("Successfully Imported all models")
    from app.routes.users import users_blueprint
    app.register_blueprint (users_blueprint, url_prefix='/api/users') # Prefix all routes with /users

    # #from app.routes.billing import billing_blueprint
    # #app.register_blueprint(billing_blueprint, url_prefix='/billing')
    
    from app.routes.cases import cases_blueprint
    app.register_blueprint(cases_blueprint, url_prefix='/api/cases')

    from app.routes.customers import customers_blueprint
    app.register_blueprint(customers_blueprint, url_prefix='/api/customers')

    from app.routes.documents import documents_blueprint
    app.register_blueprint(documents_blueprint, url_prefix='/api/documents')

    # from app.routes.invoices import invoices_blueprint
    # app.register_blueprint(invoices_blueprint, url_prefix='/invoices')

    # from app.routes.payments import payments_blueprint
    # app.register_blueprint(payments_blueprint, url_prefix='/payments')

    # from app.routes.tasks import tasks_blueprint
    # app.register_blueprint(tasks_blueprint, url_prefix='/tasks')

    from app.routes.workflows import workflows_blueprint
    app.register_blueprint(workflows_blueprint, url_prefix='/api/workflows')

    from app.routes.statuses import statuses_blueprint
    app.register_blueprint(statuses_blueprint, url_prefix='/api/statuses')

    # # Set login manager login view
    # login_manager.login_view = 'users.login'

    # # user loader callback for Flask-Login
    # @login_manager.user_loader
    # def load_user(user_id):
    #     return models.User.query.get(int(user_id))

    return app
