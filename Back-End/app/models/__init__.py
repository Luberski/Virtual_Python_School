from app.db import db, ModelBase, AutoFieldsRepr


class User(ModelBase):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    zut_id = db.Column(db.String(255), unique=True)
    username = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)

    __repr__ = AutoFieldsRepr()

