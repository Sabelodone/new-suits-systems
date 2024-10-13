from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .base_model import BaseModel


class Subscription(BaseModel):
    __tablename__ = 'subscription'
    user_id = db.Column(db.String(32), db.ForeignKey('user.id'), primary_key=True)
    user = db.relationship('User', back_populates='subscription')
    subscription_id = db.Column(db.String(32), db.ForeignKey('subscription_plan.id'), primary_key=True)
    subscription = db.relationship('SubscriptionPlan', back_populates='subscription')
    start_date = db.Column(db.DateTime, default=db.func.now())
    renewal = db.Column(db.Boolean, default=False)
    end_date = db.Column(db.DateTime)
