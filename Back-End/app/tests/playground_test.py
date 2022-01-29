from . import *


def test_playground_should_return_status_code_500_if_cannot_connect_to_container(app):
    client = app.test_client()
    response = client.post(
        "/api/playground", data={"data": {"content": "print('hello world')"}}
    )

    assert response.status_code == 500
