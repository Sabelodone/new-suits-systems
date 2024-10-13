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

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description
        }

db.Index('idx_case_title', Case.title)
