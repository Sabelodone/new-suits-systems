from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.base_model import BaseModel


# NEEDS FURTHER REVIEW

class LawfirmEmployeeRole(BaseModel):
    __tablename__ = 'lawfirm_employee_roles'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), nullable=False, primary_key=True)
    user = db.relationship('User')

    role_id = db.Column(db.String(32), db.ForeignKey('lawfirm_roles.id', ondelete='CASCADE'), nullable=False, primary_key=True)  # Updated ForeignKey
    role = db.relationship('LawfirmRole')


    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role_id': self.role_id
        }
