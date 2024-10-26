from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from app.models.base_model import BaseModel


class UserRoles(BaseModel):
    __tablename__ = 'user_roles'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'))
    user = db.relationship('User', back_populates='user_roles')

    role_id = db.Column(db.String(32), db.ForeignKey('role.id'))
    role = db.relationship('Role', back_populates='user_roles')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role_id': self.role_id
        }
