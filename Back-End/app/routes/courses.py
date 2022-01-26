import os
from app import models
from app.db import db
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from . import routes


@routes.route("/api/courses/add", methods=["POST"])
@jwt_required()
def create_course():
    if request.method == "POST":

        username = get_jwt()['sub']
        if username is None:
            return jsonify({"error": 500})

        if request.form["key"] != os.getenv("MASTER_KEY"):
            return jsonify({"error": 403})

        
        new_course = models.Courses(
            name = request.form["name"],
            description = request.form["description"],
            sections = request.form["sections"]
        )

        new_course.add()


        return jsonify(
            {
                "data": {
                    "name": new_course.name,
                    "description": new_course.description,
                    "sections": new_course.sections
                },
                "error": None,
            }
        )
