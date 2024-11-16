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
    status = db.relationship('TaskStatus', back_populates='tasks')

    due_date = db.Column(db.DateTime, nullable=True)  # Ensure this field exists
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status.name if self.status else None,  # Returning status name
            'status_id': selft.status.id if self.status else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,  # Format for the frontend
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

