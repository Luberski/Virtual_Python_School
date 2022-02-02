from datetime import date, datetime
import os
from unittest import result
from app.db import db
from app import models
from flask import request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from . import routes


@routes.route("/api/courses", methods=["POST"])
@jwt_required()
def create_course():
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


@routes.route("/api/courses/edit", methods=["POST"])
@jwt_required()
def edit_course():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if request.json["data"]["key"] != os.getenv("MASTER_KEY"):
        return make_response(jsonify({"error": "Bad key"}), 403)

    id_course = request.json["data"]["id_course"]
    course_edit = models.Courses().query.filter_by(id=id_course).first()

    to_commit = False
    if request.json["data"]["name"] != "None":
        course_edit.name = request.json["data"]["name"]
        to_commit = True

    if request.json["data"]["description"] != "None":
        course_edit.description = request.json["data"]["description"]
        to_commit = True

    if request.json["data"]["sections"] != "None":
        course_edit.sections = request.json["data"]["sections"]
        to_commit = True

    if to_commit is True:
        db.session.commit()

    return make_response(
        jsonify(
            {
                "data": {
                    "name": course_edit.name,
                    "description": course_edit.description,
                    "sections": course_edit.sections,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/courses/delete", methods=["POST"])
@jwt_required()
def delete_course():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if request.json["data"]["key"] != os.getenv("MASTER_KEY"):
        return make_response(jsonify({"error": "Bad key"}), 403)

    id_course = request.json["data"]["id_course"]
    # change this after add sections + find better option to save completed courses
    models.CoursesTaken().query.filter_by(id_course=id_course).delete()

    models.Courses().query.filter_by(id=id_course).delete()

    db.session.commit()

    return make_response(jsonify({"data": "Course deleted", "error": None, }), 200,)


@routes.route("/api/courses", methods=["GET"])
@jwt_required()
def get_course_me():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    user = models.User().query.filter_by(username=username).first()
    courses = models.CoursesTaken().query.filter_by(id_user=user.id).all()
    if courses == None:
        return make_response(jsonify({"error": "Courses not found"}), 404)

    # find better solution
    courses_taken = []
    for course in courses:
        courses_taken.append(
            {
                "data_course": {
                    "username": username,
                    "id_course": course.id_course,
                    "start_date": course.start_date,
                    "end_date": course.end_date,
                    "section_number": course.section_number,
                    "completed": course.completed,
                }
            }
        )

    return make_response(jsonify({"data": courses_taken, "error": None}), 200, )


@routes.route("/api/courses/id", methods=["POST"])
@jwt_required()
def get_course_id():

    id = request.json["data"]["id"]
    user = models.User().query.filter_by(username=id).first()
    if user is None:
        return make_response(jsonify({"error": "User not found"}), 404)

    courses = models.CoursesTaken().query.filter_by(id_user=user.id).all()
    if courses == None:
        return make_response(jsonify({"error": "Courses not found"}), 404)

    # find better solution
    courses_taken = []
    for course in courses:
        courses_taken.append(
            {
                "data_course": {
                    "username": user.username,
                    "id_course": course.id_course,
                    "start_date": course.start_date,
                    "end_date": course.end_date,
                    "section_number": course.section_number,
                    "completed": course.completed,
                }
            }
        )

    return make_response(jsonify({"data": courses_taken, "error": None}), 200, )


@routes.route("/api/course", methods=["POST"])
@jwt_required()
def join_course_me():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    user = models.User().query.filter_by(username=username).first()

    course_wanted = request.json["data"]["id_course"]

    if course_wanted == None:
        return make_response(jsonify({"error": "Course does not exist"}), 403)

    course_query = models.Courses().query.filter_by(id=course_wanted).first()

    if course_query == None:
        return make_response(jsonify({"error": "Course not found"}), 404)

    check_exist = models.CoursesTaken().query.filter_by(
        id_user=user.id, id_course=course_wanted).first()
    if check_exist is not None:
        return make_response(jsonify({"error": "User attends in course"}), 403)

    course_taken = models.CoursesTaken(
        id_course=course_query.id,
        id_user=user.id,
        start_date=datetime.now(),
        end_date=None,
        section_number=0,
        completed="False",
    )
    course_taken.add()

    return make_response(
        jsonify(
            {
                "data": {
                    "username": username,
                    "id_user": course_taken.id_user,
                    "id_course": course_taken.id_course,
                    "start_date": course_taken.start_date,
                    "end_date": course_taken.end_date,
                    "section_number": course_taken.section_number,
                    "completed": course_taken.completed,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/course/id", methods=["POST"])
@jwt_required()
def join_course_id():
    if request.json["data"]["key"] != os.getenv("MASTER_KEY"):
        return make_response(jsonify({"error": "Bad key"}), 403)

    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)

    id = request.json["data"]["id"]
    user = models.User().query.filter_by(username=id).first()
    if user is None:
        return make_response(jsonify({"error": "User not found"}), 404)

    course_wanted = request.json["data"]["id_course"]

    if course_wanted == None:
        return make_response(jsonify({"error": "Course does not exist"}), 403)

    course_query = models.Courses().query.filter_by(id=course_wanted).first()

    if course_query == None:
        return make_response(jsonify({"error": "Course not found"}), 404)

    check_exist = models.CoursesTaken().query.filter_by(
        id_user=user.id, id_course=course_wanted).first()
    if check_exist is not None:
        return make_response(jsonify({"error": "User attends in course"}), 403)

    course_taken = models.CoursesTaken(
        id_course=course_query.id,
        id_user=user.id,
        start_date=datetime.now(),
        end_date=None,
        section_number=0,
        completed="False",
    )
    course_taken.add()

    return make_response(
        jsonify(
            {
                "data": {
                    "username": username,
                    "id_user": course_taken.id_user,
                    "id_course": course_taken.id_course,
                    "start_date": course_taken.start_date,
                    "end_date": course_taken.end_date,
                    "section_number": course_taken.section_number,
                    "completed": course_taken.completed,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/course/close/me", methods=["POST"])
@jwt_required()
def close_course_me():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    user = models.User().query.filter_by(username=username).first()

    course_wanted = request.json["data"]["id_course"]

    if course_wanted == None:
        return make_response(jsonify({"error": "Course does not exist"}), 403)

    course_query = models.Courses().query.filter_by(id=course_wanted).first()

    if course_query == None:
        return make_response(jsonify({"error": "Course not found"}), 404)

    course_to_close = models.CoursesTaken().query.filter_by(
        id_user=user.id, id_course=course_wanted).first()
    if course_to_close is None:
        return make_response(jsonify({"error": "User not attends in course"}), 403)

    course_to_close.end_date = datetime.now()
    # automatic completed after add lessions

    db.session.commit()

    return make_response(
        jsonify(
            {
                "data": {
                    "username": username,
                    "id_user": course_to_close.id_user,
                    "id_course": course_to_close.id_course,
                    "start_date": course_to_close.start_date,
                    "end_date": course_to_close.end_date,
                    "section_number": course_to_close.section_number,
                    "completed": course_to_close.completed,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/course/close", methods=["POST"])
@jwt_required()
def close_course_id():
    if request.json["data"]["key"] != os.getenv("MASTER_KEY"):
        return make_response(jsonify({"error": "Bad key"}), 403)

    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)

    id = request.json["data"]["id"]
    user = models.User().query.filter_by(username=id).first()
    if user is None:
        return make_response(jsonify({"error": "User not found"}), 404)

    course_wanted = request.json["data"]["id_course"]

    if course_wanted == None:
        return make_response(jsonify({"error": "Course does not exist"}), 403)

    course_query = models.Courses().query.filter_by(id=course_wanted).first()

    if course_query == None:
        return make_response(jsonify({"error": "Course not found"}), 404)

    course_to_close = models.CoursesTaken().query.filter_by(
        id_user=user.id, id_course=course_wanted).first()
    if course_to_close is None:
        return make_response(jsonify({"error": "User not attends in course"}), 403)

    course_to_close.end_date = datetime.now()
    # automatic completed after add lessions

    db.session.commit()

    return make_response(
        jsonify(
            {
                "data": {
                    "username": username,
                    "id_user": course_to_close.id_user,
                    "id_course": course_to_close.id_course,
                    "start_date": course_to_close.start_date,
                    "end_date": course_to_close.end_date,
                    "section_number": course_to_close.section_number,
                    "completed": course_to_close.completed,
                },
                "error": None,
            }
        ),
        200,
    )
