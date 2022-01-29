from app import models
from flask import request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from . import routes


@routes.route("/api/users/me", methods=["GET"])
@jwt_required()
def get_user_me():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "User not found"}), 404)

    user = models.User().query.filter_by(username=username).first()

    if user is None:
        return make_response(jsonify({"error": "User not found"}), 404)

    return make_response(
        jsonify(
            {
                "data": {
                    "username": user.username,
                    "zutID": user.zut_id,
                    "name": user.name,
                    "lastName": user.last_name,
                    "email": user.email,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/users", methods=["POST"])
def get_user_by_id():
    id = request.json["data"]["id"]
    user = models.User().query.filter_by(username=id).first()

    if user is None:
        return make_response(jsonify({"error": "User not found"}), 404)

    return make_response(
        jsonify(
            {"data": {"username": user.username, "email": user.email,}, "error": None,}
        ),
        200,
    )
