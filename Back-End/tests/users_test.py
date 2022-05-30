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
 

def test_users_me_should_return_status_code_401_if_no_token(app):
    client = app.test_client()
    response = client.get("/api/users/me")

    assert response.status_code == 401

def test_user_me_should_return_status_code_200_if_token(app):
    client = app.test_client()
    headers = login_in(client)
    response = client.get("/api/users/me", headers=headers)
    
    assert response.status_code == 200

def test_get_user_by_id_should_return_status_code_200_if_token_and_user_is_present(app):
    client = app.test_client()
    headers = login_in(client)
    response = client.post("/api/users",
                                data=json.dumps(dict(data=dict(id=os.getenv("TEST_USER_IPA")))),
                                headers=headers,
                                content_type="application/json")
    
    assert response.status_code == 200

def test_create_role_should_return_status_code_200_if_admin_with_token_and_role_dont_exist(app):
    client = app.test_client()
    data=json.dumps(dict(data=dict(role_name="testowa")))
    headers = login_in(client)
    response = client.post("/api/role",
                                data=data,
                                headers=headers,
                                content_type="application/json")
    
    assert response.status_code == 200

def test_create_role_should_return_status_code_403_if_Role_exist(app):
    client = app.test_client()
    data=json.dumps(dict(data=dict(role_name="testowa")))
    headers = login_in(client)
    response = client.post("/api/role",
                                data=data,
                                headers=headers,
                                content_type="application/json")
    
    response = client.post("/api/role",
                                data=data,
                                headers=headers,
                                content_type="application/json")
    

    assert response.status_code == 403



