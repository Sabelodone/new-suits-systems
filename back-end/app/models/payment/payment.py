from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.primarykey_base_model import PrimaryKeyBaseModel


class Payment(PrimaryKeyBaseModel):
    __tablename__ = 'payment'
    invoice_id = db.Column(db.String(32), db.ForeignKey('invoice.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'amount': self.amount
        }
