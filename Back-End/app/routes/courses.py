from app import models
from app.db import db
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from . import routes


@routes.route("/api/users/", methods=["POST"])
def get_courses_info():
    if request.method == "POST":

        id = request.form["id"]
        user = (
            models.User()
                .query.filter_by(username=id)
                .first()
        )

        if user is None:
            return jsonify({"error": 500})

        return jsonify(
            {
                "data": {
                    "username": user.username,
                    "email": user.email,
                },
                "error": None,
            }
        )
