from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class Document(PrimaryKeyBaseModel):
    __tablename__ = 'document'
    file_name = db.Column(db.String(120), nullable=False)
    file_desc = db.Column(db.LargeBinary, nullable=False)
    link = db.Column(db.String(255), nullable=False)

    case_id = db.Column(db.String(32), db.ForeignKey('case.id'))
    case = db.relationship('Case', back_populates='documents')

    document_type_id = db.Column(db.String(32), db.ForeignKey('document_type.id'))
    type = db.relationship('DocumentType', back_populates='documents')

    document_histories = db.relationship('DocumentHistory', back_populates='document')

    document_status_id = db.Column(db.String(32), db.ForeignKey('document_status.id'))
    status = db.relationship('DocumentStatus', back_populates='documents')

    def to_dict(self):
        return {
            'id': self.id,
            'file_name': self.file_name
        }
