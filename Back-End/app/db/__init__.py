from flask_sqlalchemy import SQLAlchemy
from app.application import application as app

db = SQLAlchemy(app)
