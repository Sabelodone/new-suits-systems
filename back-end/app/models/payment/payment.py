from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.primarykey_base_model import PrimaryKeyBaseModel


class Payment(PrimaryKeyBaseModel):
    __tablename__ = 'payment'
    sales_invoice_id = db.Column(db.String(32), db.ForeignKey('sales_invoice.id'), nullable=False)
    sales_invoice = db.relationship('SalesInvoice')

    payment_method_id = db.Column(db.String(32), db.ForeignKey('payment_methods.id'), nullable=False)
    payment_method = db.relationship('PaymentMethods')

    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(32), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'sales_invoice_id': self.sales_invoice_id,
            'payment_method_id': self.payment_method_id,
            'amount': self.amount,
            'date': self.date,
            'status': self.status
        }

    def update_invoice_status(self):
        required_price = self.sales_invoice.net_total
        paid_price = self.amount

        if required_price > paid_price:
            self.sales_invoice.change_status('PARTIALLY PAID')
        else:
            self.sales_invoice.change_status('PAID')
