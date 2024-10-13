from flask_sqlalchemy import SQLAlchemy
from app.extentions import db


class BaseModel(db.Model):
    __abstract__ = True

    # id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(),
                           onupdate=db.func.current_timestamp())
    
    # created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    # updated_by = db.Column(db.Integer, db.ForeignKey('user.id'))

    def to_dict(self):
        raise NotImplementedError('Subclasses must implement this method')
