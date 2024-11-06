from flask_sqlalchemy import SQLAlchemy
from .primarykey_base_model import PrimaryKeyBaseModel
from app.extentions import db


class Case(PrimaryKeyBaseModel):
    __tablename__ = 'case'
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)

    status_id = db.Column(db.String(32), db.ForeignKey('case_status.id'))
    status = db.relationship('CaseStatus', backref='cases')

    category_id = db.Column(db.String(32), db.ForeignKey('case_category.id'))
    category = db.relationship('CaseCategory', backref='cases')

    lawfirm_id = db.Column(db.String(32), db.ForeignKey('lawfirm.user_id'))
    lawfirm = db.relationship('LawFirm', back_populates='cases')

    tasks = db.relationship('Task', back_populates='case', cascade="all, delete-orphan")
    documents = db.relationship('Document', back_populates='case', cascade="all, delete-orphan")

    def to_dict(self):

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status.name if self.status else 'N/A',
            'workflow': self.workflow.name if self.workflow else 'N/A',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

db.Index('idx_case_title', Case.title)
