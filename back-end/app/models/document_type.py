from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class DocumentType(PrimaryKeyBaseModel):
    __tablename__ = 'document_type'
    name = db.Column(db.String(100), nullable=False)
    documents = db.relationship('Document', back_populates='type')
