from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.primarykey_base_model import PrimaryKeyBaseModel


class Invoice(PrimaryKeyBaseModel):
    __tablename__ = 'invoice'
    customer_id = db.Column(db.String(32), db.ForeignKey('customer.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'amount': self.amount
        }
