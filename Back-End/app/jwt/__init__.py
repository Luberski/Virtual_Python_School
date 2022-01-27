import os
from flask_jwt_extended import JWTManager
from app.application import application as app


app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_BLOCKLIST_ENABLED"] = True
app.config["JWT_BLOCKLIST_TOKEN_CHECKS"] = ["access", "refresh"]

jwt = JWTManager(app)
