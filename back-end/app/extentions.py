from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from flask_login import LoginManager
from flask_session import Session
from flask_migrate import Migrate


db = SQLAlchemy()
login_manager = LoginManager()
sess = Session()
swagger = Swagger()

migration = Migrate(directory='./app/migrations')
