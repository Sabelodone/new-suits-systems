from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import UserMixin
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel
import datetime

bcrypt = Bcrypt()

class User(PrimaryKeyBaseModel, UserMixin):
    __tablename__ = 'user'
    
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(30), nullable=False)
    middle_name = db.Column(db.String(30), nullable=True)
    last_name = db.Column(db.String(30), nullable=False)
    birthdate = db.Column(db.DateTime)

    # Relationships
    phones = db.relationship('PhoneNumber', back_populates='user', cascade="all, delete-orphan")
    lawfirm_employee = db.relationship('LawFirmEmployee', back_populates='user')
    lawfirm = db.relationship('LawFirm', back_populates='user', uselist=False)
    gender_id = db.Column(db.String(32), db.ForeignKey('gender.id'), nullable=False)
    gender = db.relationship('Gender', backref='users')
    document_histories = db.relationship('DocumentHistory', back_populates='user')
    #user_roles = db.relationship('UserRoles', back_populates='user', cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        #self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
        #return check_password(self.password_hash, password)

    def age(self):
        if self.birthdate:
            today = datetime.datetime.today()
            return today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
        return None

    def get_roles(self):
        return [role.role.name for role in self.user_roles]  # Fetch role names

db.Index('idx_user_email', User.email)
db.Index('idx_user_username', User.username)

