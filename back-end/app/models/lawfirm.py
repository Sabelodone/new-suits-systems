from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .base_model import BaseModel


class LawFirm(BaseModel):
    __tablename__ = 'lawfirm'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    user = db.relationship('User', back_populates='lawfirm')
    employees_count = db.Column(db.Integer, nullable=True)
    employees = db.relationship('LawFirmEmployee', back_populates='lawfirm', cascade="all, delete-orphan")
    cases = db.relationship('Case', back_populates='lawfirm', cascade="all, delete-orphan")
