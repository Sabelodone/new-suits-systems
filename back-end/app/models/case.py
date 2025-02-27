from flask_sqlalchemy import SQLAlchemy
from .primarykey_base_model import PrimaryKeyBaseModel
from app.extentions import db


class Case(PrimaryKeyBaseModel):
    __tablename__ = 'case'
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    case_type_id = db.Column(db.String(32), db.ForeignKey('case_types.id'))
    case_type = db.relationship('CaseType', back_populates='cases')
    current_step_id = db.Column(db.String(32), db.ForeignKey('workflow_steps.id'))
    current_step = db.relationship('WorkflowStep')
    status_history = db.relationship('CaseStatusHistory', back_populates='case')

    lawfirm_id = db.Column(db.String(32), db.ForeignKey('lawfirm.user_id'))
    lawfirm = db.relationship('LawFirm', back_populates='cases')

    tasks = db.relationship('Task', back_populates='case', cascade="all, delete-orphan")
    documents = db.relationship('Document', back_populates='case', cascade="all, delete-orphan")

    #workflow_id = db.Column(db.Integer, db.ForeignKey('workflows.id'))
    #Sworkflow = db.relationship('Workflow', back_populates="cases")

    def to_dict(self):

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            #'status': self.status.name if self.status else 'N/A',
            'case_type': self.case_type.name if self.case_type else None,
            'workflow': self.case_type.workflow.name if self.case_type and self.case_type.workflow else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
         }
    
class CaseStatusHistory(PrimaryKeyBaseModel):
    __tablename__ = 'case_status_history'
    case_id = db.Column(db.String(32), db.ForeignKey('case.id'))
    case = db.relationship('Case', back_populates='status_history')
    step_id = db.Column(db.String(32), db.ForeignKey('workflow_steps.id'))
    status_id = db.Column(db.String(32), db.ForeignKey('workflow_statuses.id'))
    timestamp = db.Column(db.DateTime, default=db.func.now())

db.Index('idx_case_title', Case.title)
