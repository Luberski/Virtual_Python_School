from flask_jwt_extended import JWTManager
from app.application import application as app


jwt = JWTManager(app)
