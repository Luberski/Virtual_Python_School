# pylint: disable=W0613,C0413,W0611
import json
from tests.utils import (
    clear_db,
    CREATE_COURSE_TEST_DATA,
    client,
    mock_create_course,
    mock_login,
)


def test_create_course_should_return_status_code_201_if_admin_with_token():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)

    assert mocked_course.status_code == 201
    assert mocked_course.json()["data"]["name"] == "test_name"
    assert mocked_course.json()["data"]["description"] == "test_desc"


def test_get_courses_by_id_should_return_status_code_200_if_with_token_and_id_course_is_1():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    response = client.get(
        "/api/courses/1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["name"] == mocked_course.json()["data"]["name"]
    assert (
        response.json()["data"]["description"]
        == mocked_course.json()["data"]["description"]
    )


def test_get_courses_by_id_should_return_status_code_404_if_with_token_and_id_course_is_not_in_database():
    token, _ = mock_login()
    response = client.get(
        "/api/courses/999",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


def test_join_course_me_should_return_status_code_200_if_not_joined_and_exist():
    token, username = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    response = client.post(
        "/api/course",
        json={"data": {"id_course": 1}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["username"] == username


def test_join_course_me_should_return_status_code_404_if_does_not_exist():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    response = client.post(
        "/api/course",
        json={"data": {"id_course": 9999}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


def test_edit_course_should_return_status_code_200_if_admin_with_token_and_edited():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201

    edit_response = client.patch(
        "/api/courses",
        data=json.dumps(dict(data=dict(id_course=1, description="test_desc_edited"))),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert edit_response.status_code == 200
    assert edit_response.json()["data"]["description"] == "test_desc_edited"


def test_delete_course_should_return_status_code_200_if_admin_with_token():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201

    response = client.delete(
        "/api/courses/1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


def test_get_courses_all_should_return_status_code_200_if_with_token():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201
    response = client.get(
        "/api/courses",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"][0]["name"] == "test_name"
    assert response.json()["data"][0]["description"] == "test_desc"


def test_get_courses_all_featured_should_return_status_code_200_if_with_token():
    token, _ = mock_login()
    response = client.post(
        "/api/courses",
        json={
            "data": {"name": "test_name", "description": "test_desc", "featured": True}
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    response = client.get(
        "/api/courses/featured",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"][0]["name"] == "test_name"
    assert response.json()["data"][0]["description"] == "test_desc"
    assert response.json()["data"][0]["featured"] is True


def test_get_courses_me_should_return_status_code_200_if_with_token():
    token, username = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201

    response = client.post(
        "/api/course",
        json={"data": {"id_course": 1}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    response = client.get(
        "/api/courses/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"][0]["username"] == username


def test_get_enrolled_courses_should_return_status_code_200_if_with_token():
    token, _ = mock_login()
    mocked_course = mock_create_course(token, CREATE_COURSE_TEST_DATA)
    assert mocked_course.status_code == 201

    response = client.post(
        "/api/course",
        json={"data": {"id_course": 1}},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200

    response = client.get(
        "/api/courses/enrolled",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"][0]["name"] == "test_name"
    assert response.json()["data"][0]["description"] == "test_desc"
