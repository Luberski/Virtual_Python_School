from . import *


def test_users_me_should_return_status_code_401_if_no_token(app):
    client = app.test_client()
    response = client.get("/api/users/me")

    assert response.status_code == 401
