import os
from datetime import timedelta
from flask import Flask
from flask_cors import CORS

cors = CORS()


def create_app():
    application = Flask(__name__)
    application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    application.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")

    application.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    application.config["JWT_BLOCKLIST_ENABLED"] = True
    application.config["JWT_BLOCKLIST_TOKEN_CHECKS"] = ["access", "refresh"]
    application.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=720)

    cors.init_app(
        app=application,
        supports_credentials=True,
        resources={r"/api/*": {"origins": "*"}},
    )
    return application


application = create_app()
