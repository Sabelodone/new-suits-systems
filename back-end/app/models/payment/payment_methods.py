from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.primarykey_base_model import PrimaryKeyBaseModel


class PaymentMethods(PrimaryKeyBaseModel):
    __tablename__ = 'payment_methods'
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }
