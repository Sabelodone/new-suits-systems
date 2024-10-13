from .base_model import BaseModel
from app.extentions import db


class PrimaryKeyBaseModel(BaseModel):
    __abstract__ = True
    id = db.Column(db.String(32), primary_key=True)
