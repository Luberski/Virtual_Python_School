# pylint: disable=W0613,C0413,W0611
from tests.utils import client, mock_login, clear_db


def test_users_me_should_return_status_code_401_if_no_token():
    response = client.get("/api/users/me")
    assert response.status_code == 401


def test_user_me_should_return_status_code_200_if_token():
    token, _ = mock_login()
    response = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200


def test_get_user_by_username_should_return_status_code_200_if_token_and_user_is_present():
    token, username = mock_login()
    response = client.post(
        "/api/users",
        json={"username": username},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["data"]["username"] == username
