from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.base_model import BaseModel

class UserRoles(BaseModel):
    __tablename__ = 'user_roles'
    
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), nullable=False, primary_key=True)
    user = db.relationship('User')

    role_id = db.Column(db.String(32), db.ForeignKey('roles.id'), nullable=False, primary_key=True)
    role = db.relationship('Role')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role_id': self.role_id
        }