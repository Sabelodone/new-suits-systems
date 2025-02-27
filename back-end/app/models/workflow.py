# back-end/app/models/workflow.py

from flask_sqlalchemy import SQLAlchemy
from app.models.primarykey_base_model import PrimaryKeyBaseModel
from app.extentions import db

class Workflow(PrimaryKeyBaseModel):
    __tablename__ = 'workflows'
    name = db.Column(db.String(50), nullable=False)
    steps = db.relationship('WorkflowStep', back_populates='workflow', cascade="all, delete-orphan")
    case_types = db.relationship('CaseType', back_populates='workflow')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            #'steps': self.next_step_id,
            #'is_terminal': self.is_terminal
        }


class WorkflowStep(PrimaryKeyBaseModel):
    __tablename__ = 'workflow_steps'
    workflow_id = db.Column(db.String(32), db.ForeignKey('workflows.id'), nullable=False)
    workflow = db.relationship('Workflow', back_populates='steps')
    step_order = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    requires_payment = db.Column(db.Boolean, default=False)
    
    statuses = db.relationship(
        'WorkflowStatus',
        foreign_keys='WorkflowStatus.step_id',
        back_populates='step',
        cascade='all, delete-orphan'
    )

