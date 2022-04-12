import os
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask import Flask
import pytest
from dotenv import load_dotenv
from app.routes import *

load_dotenv()


@pytest.fixture
def app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("TEST_SQLALCHEMY_DATABASE_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_BLOCKLIST_ENABLED"] = True
    app.config["JWT_BLOCKLIST_TOKEN_CHECKS"] = ["access", "refresh"]

    db = SQLAlchemy()
    db.init_app(app)
    jwt = JWTManager()
    jwt.init_app(app)

    app.register_blueprint(routes)

    return app
