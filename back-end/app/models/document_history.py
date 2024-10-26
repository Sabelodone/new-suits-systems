from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class DocumentHistory(PrimaryKeyBaseModel):
    __tablename__ = 'document_history'
    document_id = db.Column(db.String(32), db.ForeignKey('document.id'))
    document = db.relationship('Document', back_populates='document_histories')

    user_id = db.Column(db.String(32), db.ForeignKey('user.id'))
    user = db.relationship('User', back_populates='document_histories')

    action = db.Column(db.String(32), nullable=False)
    action_date = db.Column(db.DateTime, nullable=False)

    column_name = db.Column(db.String(30), nullable=True)
    old_value = db.Column(db.String(500), nullable=True)
    new_value = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'document': self.document.to_dict(),
            'user': self.user.to_dict(),
            'action': self.action,
            'action_date': self.action_date
        }
