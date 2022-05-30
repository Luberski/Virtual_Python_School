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


@pytest.fixture(scope='session', autouse=True)
def app():
    load_dotenv()
    cors = CORS()

    app = create_app()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "TEST_SQLALCHEMY_DATABASE_URI")
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


def test_create_course_should_return_status_code_200_if_admin_with_token(app):
    client = app.test_client()
    data = json.dumps(
        dict(data=dict(name="test_name", description="test_desc")))
    headers = login_in(client)
    response = client.post("/api/courses",
                                   data=data,
                                   headers=headers,
                                   content_type="application/json")

    assert response.status_code == 200

def test_get_courses_by_id_should_return_status_code_200_if_with_token_and_id_course_is_1(app):
    client = app.test_client()
    headers = login_in(client)
    response_get_all = client.get("/api/courses/1",
                                          headers=headers)
    assert response_get_all.status_code == 200

def test_get_courses_by_id_should_return_status_code_404_if_with_token_and_id_course_is_not_in_database(app):
    client = app.test_client()
    headers = login_in(client)
    response_get_all = client.get("/api/courses/999",
                                          headers=headers)
    assert response_get_all.status_code == 404

def test_join_course_me_should_return_status_code_200_if_not_joined_and_exist(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_course="1")))
    headers = login_in(client)
    response = client.post("/api/course",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200

def test_join_course_me_should_return_status_code_403_if_joined(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_course="1")))
    headers = login_in(client)
    response = client.post("/api/course",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 403

def test_join_course_me_should_return_status_code_404_if_do_not_exist(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_course="99")))
    headers = login_in(client)
    response = client.post("/api/course",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 404

def test_create_lesson_should_return_status_code_200_if_lesson_created(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_course="1",name="test_lesson",description="test_desc",type=1,number_of_answers="3",final_answer="ok")))
    headers = login_in(client)
    response = client.post("/api/lessons",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200


def test_edit_lesson_should_return_status_code_200_if_lesson_edited(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(lesson_id="1",name="testaa_lesson",description="tddest_desc",type=1,number_of_answers="43",final_answer="ok")))
    headers = login_in(client)
    response = client.patch("/api/lessons",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200

def test_get_lesson_should_return_status_code_200_if_lesson_selected_and_exist(app):
    client = app.test_client()
    headers = login_in(client)
    response = client.get("/api/courses/1/lessons",
                                    headers=headers)

    assert response.status_code == 200

def test_get_lesson_by_id_and_course_by_id_should_return_status_code_200_if_lesson_selected_and_exist(app):
    client = app.test_client()
    headers = login_in(client)
    response = client.get("/api/courses/1/lessons/1",
                                    headers=headers)

    assert response.status_code == 200

def test_create_answer_should_return_status_code_200_if_created(app):
    client = app.test_client()
    headers = login_in(client)
    data=json.dumps(dict(data=dict(id_lesson="1",final_answer="2")))
    response = client.post("/api/answers",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200

def test_check_answer_should_return_status_code_200_if_lession_exists_and_answer_is_true(app):
    client = app.test_client()
    headers = login_in(client)
    data=json.dumps(dict(data=dict(id_lesson="1",answer="2")))
    response = client.post("/api/answers/check",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200
    assert b"true" in response.data

def test_check_answer_should_return_status_code_200_if_lession_exists_and_answer_is_false(app):
    client = app.test_client()
    headers = login_in(client)
    data=json.dumps(dict(data=dict(id_lesson="1",answer="3")))
    response = client.post("/api/answers/check",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200
    assert b"false" in response.data

def test_get_answers_should_return_status_code_200_if_answers_found(app):
    client = app.test_client()
    headers = login_in(client)
    data=json.dumps(dict(data=dict(id_lesson="1")))
    response = client.get("/api/answers",
                                    headers=headers,
                                    data=data,
                                    content_type="application/json")

    assert response.status_code == 200

def test_create_comment_should_return_status_code_200_if_comment_created(app):
    client = app.test_client()
    headers = login_in(client)
    data=json.dumps(dict(data=dict(id_lesson="1",content="test_comment")))
    response = client.post("/api/comments",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200
    assert b"test_comment" in response.data

def test_edit_comment_should_return_status_code_200_if_comment_edited(app):
    client = app.test_client()
    headers = login_in(client)
    data=json.dumps(dict(data=dict(id="1",content="test_comment_new")))
    response = client.patch("/api/comments",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200
    assert b"test_comment_new" in response.data


def test_get_comments_should_return_status_code_200_if_comments_found(app):
    client = app.test_client()
    headers = login_in(client)
    data = json.dumps(dict(data=dict(id_lesson="1")))
    response = client.get("/api/comments",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200



def test_delete_comment_should_return_status_code_200_if_comment_deleted(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_comment="1")))
    headers = login_in(client)
    response = client.delete("/api/comments",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200



def test_delete_answer_should_return_status_code_200_if_answer_deleted(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_answer="1")))
    headers = login_in(client)
    response = client.delete("/api/answers",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200


def test_delete_lesson_should_return_status_code_200_if_lesson_deleted(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_lesson="1")))
    headers = login_in(client)
    response = client.delete("/api/lessons",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200



def test_edit_course_should_return_status_code_200_if_admin_with_token_and_edited(app):
    client = app.test_client()
    data = json.dumps(dict(
        data=dict(id_course="1", name="test_edit_name", description="test_edit_desc")))
    headers = login_in(client)
    response = client.patch("/api/courses",
                                    data=data,
                                    headers=headers,
                                    content_type="application/json")

    assert response.status_code == 200
    assert b"test_edit_name" in response.data
    assert b"test_edit_desc" in response.data


def test_delete_course_should_return_status_code_200_if_admin_with_token(app):
    client = app.test_client()
    data = json.dumps(dict(data=dict(id_course="1")))
    headers = login_in(client)
    response = client.delete("/api/courses",
                                     data=data,
                                     headers=headers,
                                     content_type="application/json")

    assert response.status_code == 200


def test_get_courses_all_should_return_status_code_200_if_with_token(app):
    client = app.test_client()
    headers = login_in(client)
    response_add = client.get("/api/courses",
                                      headers=headers,
                                      content_type="application/json")

    response_get_all = client.get("/api/courses",
                                          headers=headers)
    assert response_get_all.status_code == 200


def test_get_courses_all_featured_should_return_status_code_200_if_with_token(app):
    client = app.test_client()
    headers = login_in(client)
    response_get_all = client.get("/api/courses/featured",
                                          headers=headers)
    assert response_get_all.status_code == 200

def test_get_courses_me_should_return_status_code_200_if_with_token(app):
    client = app.test_client()
    headers = login_in(client)
    response_get_all = client.get("/api/courses/me",
                                          headers=headers)
    assert response_get_all.status_code == 200

def test_get_enrolled_courses_should_return_status_code_200_if_with_token(app):
    client = app.test_client()
    headers = login_in(client)
    response_get_all = client.get("/api/courses/enrolled",
                                          headers=headers)
    assert response_get_all.status_code == 200

