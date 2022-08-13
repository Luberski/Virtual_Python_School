from typing import Tuple
import pytest
from fastapi.testclient import TestClient
from app.schemas.answer import AnswerCreateData
from app.schemas.course import CourseCreateData
from app.schemas.lesson import LessonCreateData
from app.main import app
from app.db.session import Base, engine


CREATE_COURSE_TEST_DATA = {"name": "test_name", "description": "test_desc"}
CREATE_ANSWER_TEST_DATA = {"lesson_id": "1", "final_answer": "ok"}
CREATE_LESSON_TEST_DATA = {
    "course_id": 1,
    "name": "test_lesson",
    "description": "test_desc",
    "type": 1,
    "number_of_answers": 3,
    "final_answer": "ok",
}

TEST_USERNAME = "dj2137"
TEST_PASSWORD = "test_password1234#$"

client = TestClient(app)


def mock_login() -> Tuple[str, str]:
    username = TEST_USERNAME
    password = TEST_PASSWORD
    login_data = {
        "username": username,
        "password": password,
    }
    response = client.post("/api/login", data=login_data)
    response_data = response.json()
    return response_data["data"]["token"]["access_token"], username


def mock_create_course(token: str, data: CourseCreateData):
    response = client.post(
        "/api/courses",
        json={"data": data},
        headers={"Authorization": f"Bearer {token}"},
    )
    return response


def mock_create_lesson(token: str, lesson_data: LessonCreateData):
    response = client.post(
        "/api/lessons",
        json={"data": lesson_data},
        headers={"Authorization": f"Bearer {token}"},
    )
    return response


def mock_create_answer(token: str, answer_data: AnswerCreateData):
    response = client.post(
        "/api/answers",
        json={"data": answer_data},
        headers={"Authorization": f"Bearer {token}"},
    )
    return response


@pytest.fixture(autouse=True)
def clear_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
