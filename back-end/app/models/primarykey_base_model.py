from .base_model import BaseModel
from app.extentions import db
from uuid import uuid4


class PrimaryKeyBaseModel(BaseModel):
    __abstract__ = True
    id = db.Column(db.String(32), primary_key=True)

    def __init__(self, *args, **kwargs):
        super(PrimaryKeyBaseModel, self).__init__(*args, **kwargs)
        self.id = str(uuid4())
