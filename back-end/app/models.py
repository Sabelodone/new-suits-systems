#app/models.py
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import UserMixin
from app import db

bcrypt = Bcrypt()

# Existing Models
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)

    # New fields
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    middle_name = db.Column(db.String(30), nullable=True)
    last_name = db.Column(db.String(30), nullable=False)
    birthdate = db.Column(db.DateTime)
    age = db.Column(db.Integer)
    
    phones = db.relationship('PhoneNumber', back_populates='user', cascade="all, delete-orphan")
    lawfirm_employee = db.relationship('LawFirmEmployee', back_populates='user')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Case(db.Model):
    __tablename__ = 'case'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)

    # New relationships and fields
    status_id = db.Column(db.String(32), db.ForeignKey('case_status.id'))
    category_id = db.Column(db.String(32), db.ForeignKey('case_category.id'))
    lawfirm_id = db.Column(db.String(32), db.ForeignKey('lawfirm.user_id'))
    created_at = db.Column(db.DateTime, default=db.func.now())
    last_updated = db.Column(db.DateTime, onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description
        }

class Task(db.Model):
    __tablename__ = 'task'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    case_id = db.Column(db.String(32), db.ForeignKey('case.id'))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description
        }

class Document(db.Model):
    __tablename__ = 'document'
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String(120), nullable=False)
    file_content = db.Column(db.LargeBinary, nullable=False)

    # New fields
    link = db.Column(db.String(255), nullable=False)
    case_id = db.Column(db.String(32), db.ForeignKey('case.id'))
    document_type_id = db.Column(db.String(32), db.ForeignKey('document_type.id'))
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'file_name': self.file_name
        }

class Customer(db.Model):
    __tablename__ = 'customer'
    id = db.Column(db.Integer, primary_key=True)
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

class Invoice(db.Model):
    __tablename__ = 'invoice'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'amount': self.amount
        }

class Payment(db.Model):
    __tablename__ = 'payment'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'amount': self.amount
        }

# New Models
class PhoneNumber(db.Model):
    __tablename__ = 'phone_number'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    phone_number = db.Column(db.String(15), primary_key=True)
    user = db.relationship('User', back_populates='phones')

class LawFirm(db.Model):
    __tablename__ = 'lawfirm'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    employees_count = db.Column(db.Integer, nullable=True)

class LawFirmEmployee(db.Model):
    __tablename__ = 'lawfirm_employee'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    national_id = db.Column(db.String(31), nullable=False)
    lawfirm_id = db.Column(db.String(32), db.ForeignKey('lawfirm.user_id'))
    user = db.relationship('User', back_populates='lawfirm_employee')

class Client(db.Model):
    __tablename__ = 'client'
    id = db.Column(db.String(32), primary_key=True)

class ClientLawFirm(db.Model):
    __tablename__ = 'client_lawfirm'
    client_id = db.Column(db.String(32), db.ForeignKey('client.id'), primary_key=True)
    lawfirm_id = db.Column(db.String(32), db.ForeignKey('lawfirm.user_id'), primary_key=True)
    status = db.Column(db.Enum('active', 'inactive'), default='active')

class SubscriptionPlan(db.Model):
    __tablename__ = 'subscription_plan'
    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    duration_in_months = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    cost = db.Column(db.Integer, nullable=False)

class Subscription(db.Model):
    __tablename__ = 'subscription'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    subscription_id = db.Column(db.String(32), db.ForeignKey('subscription_plan.id'), primary_key=True)
    start_date = db.Column(db.DateTime, default=db.func.now())
    end_date = db.Column(db.DateTime)

class CaseCategory(db.Model):
    __tablename__ = 'case_category'
    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(80), nullable=False)

class CaseStatus(db.Model):
    __tablename__ = 'case_status'
    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(30), nullable=False)

class EmployeeCase(db.Model):
    __tablename__ = 'employee_case'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    case_id = db.Column(db.String(32), db.ForeignKey('case.id'), primary_key=True)

class DocumentType(db.Model):
    __tablename__ = 'document_type'
    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class EmployeeTask(db.Model):
    __tablename__ = 'employee_task'
    task_id = db.Column(db.String(32), db.ForeignKey('task.id'), primary_key=True)
    employee_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)

# Create indexes for faster query lookup
db.Index('idx_user_email', User.email)
db.Index('idx_case_title', Case.title)

