from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class Customer(PrimaryKeyBaseModel):
    __tablename__ = 'customer'
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    billing_info = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'billing_info': self.billing_info
        }
