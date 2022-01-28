from codecs import ignore_errors


import pytest
from . import *


def test_login_should_return_status_code_400_if_no_credentials(app):
    client = app.test_client()
    response = client.post("/api/login")

    assert response.status_code == 400


def test_login_should_return_status_code_405_if_method_is_not_post(app):
    client = app.test_client()
    response = client.get("/api/login")

    assert response.status_code == 405

