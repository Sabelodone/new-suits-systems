from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class CaseStatus(PrimaryKeyBaseModel):
    __tablename__ = 'case_status'
    name = db.Column(db.String(30), nullable=False)
