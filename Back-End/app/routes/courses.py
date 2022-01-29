import os
from app import models
from flask import request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from . import routes


@routes.route("/api/courses", methods=["POST"])
@jwt_required()
def create_course():
    if request.method == "POST":

        username = get_jwt()["sub"]
        if username is None:
            return make_response(jsonify({"error": "Bad token"}), 403)
        if request.json["data"]["key"] != os.getenv("MASTER_KEY"):
            return make_response(jsonify({"error": "Bad key"}), 403)
        new_course = models.Courses(
            name=request.json["data"]["name"],
            description=request.json["data"]["description"],
            sections=request.json["data"]["sections"],
        )

        new_course.add()

        return make_response(
            jsonify(
                {
                    "data": {
                        "name": new_course.name,
                        "description": new_course.description,
                        "sections": new_course.sections,
                    },
                    "error": None,
                }
            ),
            200,
        )
