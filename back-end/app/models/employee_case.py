from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .base_model import BaseModel


class EmployeeCase(BaseModel):
    __tablename__ = 'employee_case'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    case_id = db.Column(db.String(32), db.ForeignKey('case.id'), primary_key=True)
