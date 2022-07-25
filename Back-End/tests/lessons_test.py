# pylint: disable=W0613,C0413,W0611
import json
from tests.utils import (
    clear_db,
    CREATE_COURSE_TEST_DATA,
    CREATE_LESSON_TEST_DATA,
    client,
    mock_create_course,
    mock_create_lesson,
    mock_login,
)


def test_create_lesson_should_return_status_code_201_if_lesson_created():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    response = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert response.status_code == 201
    assert response.json()["data"]["name"] == "test_lesson"
    assert response.json()["data"]["description"] == "test_desc"
    assert response.json()["data"]["type"] == 1
    assert response.json()["data"]["number_of_answers"] == 3
    assert response.json()["data"]["answers"][0]["final_answer"] == "ok"


def test_edit_lesson_should_return_status_code_200_if_lesson_edited():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    response = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert response.status_code == 201
    assert response.json()["data"]["name"] == "test_lesson"
    assert response.json()["data"]["description"] == "test_desc"
    assert response.json()["data"]["type"] == 1
    assert response.json()["data"]["number_of_answers"] == 3
    assert response.json()["data"]["answers"][0]["final_answer"] == "ok"

    edit_response = client.patch(
        "/api/lessons",
        data=json.dumps(dict(data=dict(lesson_id=1, description="test_desc_edited"))),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert edit_response.status_code == 200
    assert edit_response.json()["data"]["description"] == "test_desc_edited"


def test_get_lesson_should_return_status_code_200_if_lessons_for_given_course():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    mocked_lesson = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert mocked_lesson.status_code == 201
    assert mocked_lesson.json()["data"]["name"] == "test_lesson"
    assert mocked_lesson.json()["data"]["description"] == "test_desc"
    assert mocked_lesson.json()["data"]["type"] == 1

    response = client.get(
        "/api/courses/1/lessons",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"][0]["name"] == "test_lesson"
    assert response.json()["data"][0]["description"] == "test_desc"
    assert response.json()["data"][0]["type"] == 1
    assert response.json()["data"][0]["number_of_answers"] == 3


def test_delete_lesson_should_return_status_code_200_if_lesson_deleted():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    response = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert response.status_code == 201
    assert response.json()["data"]["name"] == "test_lesson"
    assert response.json()["data"]["description"] == "test_desc"
    assert response.json()["data"]["type"] == 1
    assert response.json()["data"]["number_of_answers"] == 3
    assert response.json()["data"]["answers"][0]["final_answer"] == "ok"

    response = client.delete(
        "/api/lessons/1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
