from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class TaskStatus(PrimaryKeyBaseModel):
    __tablename__ = 'task_status'
    name = db.Column(db.String(30), nullable=False)
    tasks = db.relationship('Task', back_populates='status')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }
