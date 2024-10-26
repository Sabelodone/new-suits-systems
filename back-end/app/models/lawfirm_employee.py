from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .base_model import BaseModel


class LawFirmEmployee(BaseModel):
    __tablename__ = 'lawfirm_employee'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    user = db.relationship('User', back_populates='lawfirm_employee')

    national_id = db.Column(db.String(31), nullable=False)

    lawfirm_id = db.Column(db.String(32), db.ForeignKey('lawfirm.user_id'))
    lawfirm = db.relationship('LawFirm', back_populates='employees')


    def to_dict(self):
        return {
            'user': self.user.to_dict(),
            'national_id': self.national_id,
            'lawfirm_id': self.lawfirm
        }
