import os
import pytest
from app.application import create_app
import app.routes as routes
from dotenv import load_dotenv
from datetime import timedelta
from flask_cors import CORS
from flask import url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from app.db import db
import json

def login_in(client):
    response = client.post(
        "/api/login", data={"username": os.getenv("TEST_USER_IPA"), "password": os.getenv("TEST_PASS_IPA")}
    )
    headers = {'Authorization': 'Bearer {}'.format(
        response.json["data"]["token"]["access_token"])}
    return headers


@pytest.fixture
def app():
    load_dotenv()    
    cors = CORS()

    app = create_app()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("TEST_SQLALCHEMY_DATABASE_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_BLOCKLIST_ENABLED"] = True
    app.config["JWT_BLOCKLIST_TOKEN_CHECKS"] = ["access", "refresh"]
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=720)
    
    
    cors.init_app(
        app=app,
        supports_credentials=True,
        resources={r"/api/*": {"origins": "*"}},
    )
    app.register_blueprint(routes)
    jwt = JWTManager()
    jwt.init_app(app)
    db.init_app(app)
    db.app = app
    migrate = Migrate(app, db)
    db.create_all()
    db.session.commit()
    yield app
    db.drop_all()
 
def test_login_should_return_status_code_400_if_no_credentials(app):
    client = app.test_client()
    response = client.post('/api/login')

    assert response.status_code == 400

 
def test_login_should_return_status_code_405_if_method_is_not_post(app):
    client = app.test_client()
    response = client.get("/api/login")

    assert response.status_code == 405

 
def test_login_should_return_status_code_400_if_no_form_data(app):
    client = app.test_client()
    response = client.post("/api/login", data={})

    assert response.status_code == 400

 
def test_login_should_return_status_code_403_if_invalid_credentials(app):
    client = app.test_client()
    response = client.post(
        "/api/login", data={"username": "invalid", "password": "invalid"}
    )

    assert response.status_code == 403

def test_login_should_return_status_code_200_if_valid_credentials_and_do_not_exist(app):
    client = app.test_client()
    response = client.post(
        "/api/login", data={"username": os.getenv("TEST_USER_IPA"), "password": os.getenv("TEST_PASS_IPA") }
    )

    assert response.status_code == 201

 
def test_login_should_return_status_code_200_if_valid_credentials_and_exist(app):
    client = app.test_client()
    login_in(client)
    response = client.post(
        "/api/login", data={"username": os.getenv("TEST_USER_IPA"), "password": os.getenv("TEST_PASS_IPA") }
    )

    assert response.status_code == 200

 
def test_logout_access_should_return_status_code_200_if_error_none(app):
    client = app.test_client()
    headers = login_in(client)
    response = client.post("/api/logout/access", headers=headers)

    assert response.status_code == 200



