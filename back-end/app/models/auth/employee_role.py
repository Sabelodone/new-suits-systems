from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.base_model import BaseModel


# NEEDS FURTHER REVIEW

class UserRoles(BaseModel):
    __tablename__ = 'user_roles'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'))
    user = db.relationship('User', back_populates='lawfirm_roles')

    role_id = db.Column(db.String(32), db.ForeignKey('lawfirm_role.id'))
    role = db.relationship('LawfirmRole', back_populates='user_roles')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role_id': self.role_id
        }
