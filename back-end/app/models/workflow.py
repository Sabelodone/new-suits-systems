from flask_sqlalchemy import SQLAlchemy
from .primarykey_base_model import PrimaryKeyBaseModel
from app.extentions import db

class Workflow(PrimaryKeyBaseModel):
    __tablename__ = 'workflows'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    # statuses = db.relationship('CaseStatus', backref='workflow', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'statuses': [status.to_dict() for status in self.statuses]
        }
     #def __repr__(self):
     #   return '''Workflow(id={self.id},''' f"<workflow(name='{self.name}')>"

