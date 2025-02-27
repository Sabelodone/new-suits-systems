from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel

class CaseType(PrimaryKeyBaseModel):
    __tablename__ = 'case_types'
    name = db.Column(db.String(80), unique=True, nullable=False)
    workflow_id = db.Column(db.String(32), db.ForeignKey('workflows.id'))
    workflow = db.relationship('Workflow', back_populates='case_types')
    cases = db.relationship('Case', back_populates='case_type')
