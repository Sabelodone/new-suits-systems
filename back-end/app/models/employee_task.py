from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .base_model import BaseModel


class EmployeeTask(db.Model):
    __tablename__ = 'employee_task'
    task_id = db.Column(db.String(32), db.ForeignKey('task.id'), primary_key=True)
    task = db.relationship('Task', back_populates='employee_tasks')

    employee_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    employee = db.relationship('User', back_populates='employee_tasks')
