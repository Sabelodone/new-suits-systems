from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class Task(PrimaryKeyBaseModel):
    __tablename__ = 'task'
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)

    case_id = db.Column(db.String(32), db.ForeignKey('case.id'))
    case = db.relationship('Case', back_populates='tasks')

    task_status_id = db.Column(db.String(32), db.ForeignKey('task_status.id'))
    task_status = db.relationship('TaskStatus', back_populates='tasks')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description
        }
