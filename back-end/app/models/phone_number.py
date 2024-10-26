from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .base_model import BaseModel


class PhoneNumber(BaseModel):
    __tablename__ = 'phone_number'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    phone_number = db.Column(db.String(15), primary_key=True)
    user = db.relationship('User', back_populates='phones')
