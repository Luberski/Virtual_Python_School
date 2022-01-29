from . import *


def test_login_should_return_status_code_400_if_no_credentials(app):
    client = app.test_client()
    response = client.post("/api/login")

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
