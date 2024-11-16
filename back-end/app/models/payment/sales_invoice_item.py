from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.base_model import BaseModel


class SalesInvoiceItem(BaseModel):
    __tablename__ = 'sales_invoice_item'
    sales_invoice_id = db.Column(db.String(32), db.ForeignKey('sales_invoice.id'), nullable=False, primary_key=True)
    sales_invoice = db.relationship('SalesInvoice', back_populates='items')

    item_id = db.Column(db.String(32), db.ForeignKey('task.id'), nullable=False, primary_key=True)
    item = db.relationship('Task')

    quantity = db.Column(db.Float, nullable=False)
    base_rate = db.Column(db.Float, nullable=False) # before discount

    discount_percentage = db.Column(db.Float, nullable=False)
    discount_amount = db.Column(db.Float, nullable=False)

    rate = db.Column(db.Float, nullable=False)     # after discount

    def to_dict(self):
        return {
            'sales_invoice_id': self.sales_invoice_id,
            'item_id': self.item_id,
            'quantity': self.quantity,
            'base_rate': self.base_rate,
            'discount_percentage': self.discount_percentage,
            'discount_amount': self.discount_amount,
            'rate': self.rate
        }

    @classmethod
    def calculate_rate(cls, base_rate, discount_percentage):
        return base_rate - cls.calculate_discount_amount(base_rate, discount_percentage)
    
    @classmethod
    def calculate_discount_amount(cls, base_rate, discount_percentage):
        return base_rate * discount_percentage / 100
