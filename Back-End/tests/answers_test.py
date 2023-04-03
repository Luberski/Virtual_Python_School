# pylint: disable=W0613,C0413,W0611
from tests.utils import (
    clear_db,
    CREATE_ANSWER_TEST_DATA,
    CREATE_COURSE_TEST_DATA,
    CREATE_LESSON_TEST_DATA,
    client,
    mock_create_answer,
    mock_create_course,
    mock_create_lesson,
    mock_login,
)


def test_create_answer_should_return_status_code_201_if_created():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    mocked_lesson = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert mocked_lesson.status_code == 201

    response = client.post(
        "/api/answers",
        json={"data": {"lesson_id": "1", "final_answer": "ok"}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201


def test_check_answer_should_return_status_code_200_if_lession_exists_and_answer_is_correct():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    mocked_lesson = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert mocked_lesson.status_code == 201
    mocked_answer = mock_create_answer(token, CREATE_ANSWER_TEST_DATA)
    assert mocked_answer.status_code == 201

    response = client.post(
        "/api/answers/check",
        json={
            "data": {
                "lesson_id": "1",
                "answer": "ok",
            }
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] is True


def test_check_answer_should_return_status_code_200_if_lession_exists_and_answer_is_incorrect():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    mocked_lesson = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert mocked_lesson.status_code == 201
    mocked_answer = mock_create_answer(token, CREATE_ANSWER_TEST_DATA)
    assert mocked_answer.status_code == 201

    response = client.post(
        "/api/answers/check",
        json={
            "data": {
                "lesson_id": "1",
                "answer": "not ok",
            }
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] is False


def test_get_answers_should_return_status_code_200_if_answers_found():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    mocked_lesson = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert mocked_lesson.status_code == 201
    mocked_answer = mock_create_answer(token, CREATE_ANSWER_TEST_DATA)
    assert mocked_answer.status_code == 201

    response = client.get(
        "/api/lessons/1/answers",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"][0]["lesson_id"] == 1


def test_delete_answer_should_return_status_code_200_if_answer_deleted():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    mocked_lesson = mock_create_lesson(token, CREATE_LESSON_TEST_DATA)
    assert mocked_lesson.status_code == 201
    mocked_answer = mock_create_answer(token, CREATE_ANSWER_TEST_DATA)
    assert mocked_answer.status_code == 201

    response = client.delete(
        "/api/answers/1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
