# back-end/app/models/workflow.py

from flask_sqlalchemy import SQLAlchemy
from app.models.base_model import BaseModel
from app.extentions import db

class Workflow(BaseModel):
    __tablename__ = 'workflows'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    
    # statuses = db.relationship('CaseStatus', backref='workflow', lazy=True)
    steps = db.relationship('WorkflowStep', backref='workflow', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'steps': [step.to_dict() for step in self.steps]
        }

class WorkflowStep(BaseModel):
    __tablename__ = 'workflow_steps'
    
    id = db.Column(db.Integer, primary_key=True)
    workflow_id = db.Column(db.Integer, db.ForeignKey('workflows.id'), nullable=False)
    step_order = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    requires_payment = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'step_order': self.step_order,
            'name': self.name,
            'requires_payment': self.requires_payment
        }

