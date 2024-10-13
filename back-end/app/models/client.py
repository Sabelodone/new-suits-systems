from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel
from datetime import datetime


class Client(PrimaryKeyBaseModel):
    __tablename__ = 'client'
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(50), nullable=False)
    phones = db.relationship('ClientPhone', back_populates='client', cascade="all, delete-orphan")
    birthdate = db.Column(db.DateTime)
    national_id = db.Column(db.String(31), nullable=False)

    gender_id = db.Column(db.String(32), db.ForeignKey('gender.id'), nullable=False)
    gender = db.relationship('Gender', backref='clients')

    def age(self):
        if self.birthdate:
            today = datetime.today()
            return today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
        return

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'middle_name': self.middle_name,
            'email': self.email,
            'phones': [phone.to_dict() for phone in self.phones],
            'birthdate': self.birthdate,
            'national_id': self.national_id,
            'gender_id' : self.gender_id
        }

