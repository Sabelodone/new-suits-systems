from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .base_model import BaseModel


class ClientLawFirm(BaseModel):
    __tablename__ = 'client_lawfirm'
    client_id = db.Column(db.String(32), db.ForeignKey('client.id'), primary_key=True)
    lawfirm_id = db.Column(db.String(32), db.ForeignKey('lawfirm.user_id'), primary_key=True)
    status = db.Column(db.Enum('active', 'inactive'), default='active')
