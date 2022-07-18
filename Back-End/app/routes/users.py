from flask import request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from app import models
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
                    "roleId": user.role_id,
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
            {
                "data": {
                    "username": user.username,
                    "email": user.email,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/role", methods=["POST"])
@jwt_required()
def create_role():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    # Change this later
    admin_id = 1
    if models.User().query.filter_by(username=username).first().role_id != admin_id:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    if (
        models.Roles()
        .query.filter_by(role_name=request.json["data"]["role_name"])
        .first()
    ) is not None:
        return make_response(jsonify({"error": "Role exits"}), 403)

    new_role = models.Roles(
        role_name=request.json["data"]["role_name"],
    )

    new_role.add()

    return make_response(
        jsonify(
            {
                "data": {
                    "id": new_role.id,
                    "role_name": new_role.role_name,
                },
                "error": None,
            }
        ),
        200,
    )
