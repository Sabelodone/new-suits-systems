from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.primarykey_base_model import PrimaryKeyBaseModel


class SalesInvoice(PrimaryKeyBaseModel):
    __tablename__ = 'sales_invoice'
    client_id = db.Column(db.String(32), db.ForeignKey('client.id'), nullable=False)
    client = db.relationship('Client', back_populates='sales_invoices')

    issue_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)

    total_discount = db.Column(db.Float, nullable=False) # before tax
    extra_discount = db.Column(db.Float, nullable=False) # after tax
    total_tax = db.Column(db.Float, nullable=False)
    grand_total = db.Column(db.Float, nullable=False)    # before tax
    net_total = db.Column(db.Float, nullable=False)      # after tax and discount

    status = db.Column(db.String(32), nullable=False)
    # payment_id = db.Column(db.String(32), db.ForeignKey('payment.id'), nullable=False)
    # payment = db.relationship('Payment', back_populates='sales_invoices')
    items = db.relationship('SalesInvoiceItem', back_populates='sales_invoice')

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'issue_date': self.issue_date,
            'due_date': self.due_date,
            'total_discount': self.total_discount,
            'extra_discount': self.extra_discount,
            'total_tax': self.total_tax,
            'grand_total': self.grand_total,
            'net_total': self.net_total,
            'status': self.status
        }
    
    def change_status(self, status):
        self.status = status
        db.session.commit()

    @classmethod
    def calculate_total_price_and_discount(cls, items):
        total_price = 0
        total_discount = 0
        for item in items:
            total_price += item.rate * item.quantity
            total_discount += item.discount_amount
        return total_price, total_discount
    
    @classmethod
    def calculate_total_tax(cls, total_price):
        from app.models.payment.sales_invoice_taxes import SalesInvoiceTaxes
        # get specific tax names from tax table
        # write code copilot
        taxes = SalesInvoiceTaxes.get_all_by(tax_type='GST')
        total_tax = 0
        if taxes:
            for tax in taxes:
                total_tax += total_price * tax.percentage / 100
        return total_tax
    

    @classmethod
    def calculate_grand_total(cls, total_price, total_tax):
        return total_price + total_tax
