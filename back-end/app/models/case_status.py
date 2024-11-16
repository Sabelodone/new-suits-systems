from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class CaseStatus(PrimaryKeyBaseModel):
    __tablename__ = 'case_status'
    name = db.Column(db.String(30), nullable=False)

    #def __repr__(self):
    #    return f"<CaseStatus(name='{self.name}')>"#, workflow_id={self.workflow_id})>"
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'wokflow_id': self.workflow_id
        }
