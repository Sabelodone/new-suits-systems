from flask_sqlalchemy import SQLAlchemy
from flasgger import Swagger
from flask_login import LoginManager
from flask_session import Session


db = SQLAlchemy()
login_manager = LoginManager()
sess = Session()
swagger = Swagger()
