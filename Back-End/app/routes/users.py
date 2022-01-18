from app import models
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from . import routes


@routes.route("/api/users/me", methods=["GET"])
@jwt_required()
def get_user_me():
    if request.method == "GET":

        username = get_jwt()['sub']
        if username is None:
            return jsonify({"error": 403})

        user = (
            models.User()
                .query.filter_by(username=username)
                .first()
        )

        if user is None:
            return jsonify({"error": 404})

        return jsonify(
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
        )


@routes.route("/api/users/", methods=["POST"])
def get_user_by_id():
    if request.method == "POST":

        id = request.form["id"]
        user = (
            models.User()
                .query.filter_by(username=id)
                .first()
        )

        if user is None:
            return jsonify({"error": 404})

        return jsonify(
            {
                "data": {
                    "username": user.username,
                    "email": user.email,
                },
                "error": None,
            }
        )
