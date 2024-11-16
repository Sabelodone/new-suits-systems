from app.extentions import db
from .base_model import BaseModel


class ClientPhone(BaseModel):
    __tablename__ = 'client_phone'
    phone_number = db.Column(db.String(15), nullable=False, primary_key=True)
    client_id = db.Column(db.String(32), db.ForeignKey('client.id'), nullable=False, primary_key=True)
    client = db.relationship('Client', back_populates='phones')

    def to_dict(self):
        return {
            'id': self.id,
            'phone_number': self.phone_number
        }
