from flask_sqlalchemy import SQLAlchemy
from app.extentions import db


class BaseModel(db.Model):
    __abstract__ = True

    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(),
                           onupdate=db.func.current_timestamp())
    
    # created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    # updated_by = db.Column(db.Integer, db.ForeignKey('user.id'))

    # def __init__(self, *args, **kwargs):
    #     super(BaseModel, self).__init__(*args, **kwargs)


    def to_dict(self):
        raise NotImplementedError('Subclasses must implement this method')
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        db.session.commit()

    @classmethod
    def get_by_id(cls, id):
        return cls.query.get(id)

    @classmethod
    def get_all(cls):
        return cls.query.all()
    
    @classmethod
    def get_all_by(cls, **kwargs):
        return cls.query.filter_by(**kwargs).all()
