from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from app.application import application as app

db = SQLAlchemy(app)
migrate = Migrate(app, db)
