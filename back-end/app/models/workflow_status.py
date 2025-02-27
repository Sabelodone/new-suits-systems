import uuid
from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel

class WorkflowStatus(PrimaryKeyBaseModel):
    __tablename__ = 'workflow_statuses'
    name = db.Column(db.String(50), nullable=False)
    step_id = db.Column(db.String(32), db.ForeignKey('workflow_steps.id'))
    step = db.relationship('WorkflowStep', back_populates='statuses')
    next_step_id = db.Column(db.String(32), db.ForeignKey('workflow_steps.id'))
    is_terminal = db.Column(db.Boolean, default=False)

    step = db.relationship(
        'WorkflowStep', 
        foreign_keys=[step_id],
        back_populates='statuses'
    )
    next_step = db.relationship(
        'WorkflowStep',
        foreign_keys=[next_step_id]
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'next_step_id': self.next_step_id,
            'is_terminal': self.is_terminal
        }
