# pylint: disable=W0613,C0413,W0611
from tests.utils import TEST_PASSWORD, TEST_USERNAME, clear_db, client


def test_login_get_tokens() -> None:
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD,
    }
    response = client.post("/api/login", data=login_data)
    response_data = response.json()
    assert response.status_code == 200 or response.status_code == 201
    assert response_data["data"]["token"]["access_token"]
    assert response_data["data"]["token"]["refresh_token"]
