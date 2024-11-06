from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.primarykey_base_model import PrimaryKeyBaseModel


class SalesInvoiceTaxes(PrimaryKeyBaseModel):
    __tablename__ = 'sales_invoice_taxes'
    tax_type = db.Column(db.String(50), nullable=False)
    tax_subtype = db.Column(db.String(50), nullable=False)

    percentage = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'tax_type': self.tax_type,
            'tax_subtype': self.tax_subtype,
            'percentage': self.percentage,
            'amount': self.amount
        }
