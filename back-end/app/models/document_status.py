from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class DocumentStatus(PrimaryKeyBaseModel):
    __tablename__ = 'document_status'
    name = db.Column(db.String(30), nullable=False)
    documents = db.relationship('Document', back_populates='status')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }
