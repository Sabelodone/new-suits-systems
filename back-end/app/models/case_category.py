from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from .primarykey_base_model import PrimaryKeyBaseModel


class CaseCategory(PrimaryKeyBaseModel):
    __tablename__ = 'case_category'
    name = db.Column(db.String(80), nullable=False)
