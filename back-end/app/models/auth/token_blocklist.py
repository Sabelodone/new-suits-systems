from flask_sqlalchemy import SQLAlchemy
from app.extentions import db
from datetime import datetime
from app.models.primarykey_base_model import PrimaryKeyBaseModel


class TokenBlocklist(PrimaryKeyBaseModel):
    token = db.Column(db.Text, nullable=True)
    create_at = db.Column(db.DateTime(), default=datetime.utcnow)

    def __repr__(self):
        return f"<Token {self.jti}>"
