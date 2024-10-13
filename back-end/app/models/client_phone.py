from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class ClientPhone(PrimaryKeyBaseModel):
    __tablename__ = 'client_phone'
    phone_number = db.Column(db.String(15), nullable=False)
    client_id = db.Column(db.String(32), db.ForeignKey('client.id'), nullable=False)
    client = db.relationship('Client', back_populates='phones')

    def to_dict(self):
        return {
            'id': self.id,
            'phone_number': self.phone_number
        }
