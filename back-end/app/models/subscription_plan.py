from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class SubscriptionPlan(PrimaryKeyBaseModel):
    __tablename__ = 'subscription_plan'
    name = db.Column(db.String(50), nullable=False)
    duration_in_months = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    cost = db.Column(db.Integer, nullable=False)
