from datetime import datetime
from flask import request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from app.db import db
from app import models
from . import routes


ADMIN_ID = 1

# TODO: add ability to mark course as featured for homepage. Max 2-3 courses can be featured.


@routes.route("/api/courses", methods=["POST"])
@jwt_required()
def create_course():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)
    new_course = models.Courses(
        name=request.json["data"]["name"],
        description=request.json["data"]["description"],
        featured=False,
    )

    if request.json["data"]["featured"] != "None":
        new_course.featured = request.json["data"]["featured"]

    new_course.add()

    return make_response(
        jsonify(
            {
                "data": {
                    "id": new_course.id,
                    "name": new_course.name,
                    "description": new_course.description,
                    "featured": new_course.featured,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/courses", methods=["PATCH"])
@jwt_required()
def edit_course():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    id_course = request.json["data"]["id_course"]
    course_edit = models.Courses().query.filter_by(id=id_course).first()

    to_commit = False
    if request.json["data"]["name"] != "None":
        course_edit.name = request.json["data"]["name"]
        to_commit = True

    if request.json["data"]["description"] != "None":
        course_edit.description = request.json["data"]["description"]
        to_commit = True

    if request.json["data"]["featured"] != "None":
        course_edit.featured = request.json["data"]["featured"]
        to_commit = True

    if to_commit is True:
        db.session.commit()

    return make_response(
        jsonify(
            {
                "data": {
                    "name": course_edit.name,
                    "description": course_edit.description,
                    "featured": course_edit.featured,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/courses", methods=["DELETE"])
@jwt_required()
def delete_course():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    id_course = request.json["data"]["id_course"]
    # change this after add sections + find better option to save completed courses
    models.CoursesTaken().query.filter_by(id_course=id_course).delete()

    models.Lessons().query.filter_by(id_course=id_course).delete()

    models.Courses().query.filter_by(id=id_course).delete()

    db.session.commit()

    return make_response(jsonify({"data": {"id": id_course}, "error": None}), 200)


@routes.route("/api/courses", methods=["GET"])
@jwt_required()
def get_courses_all():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    courses = models.Courses().query.all()
    if courses is None:
        return make_response(jsonify({"error": "Courses not found"}), 404)
    return make_response(
        jsonify(
            {
                "data": [
                    {
                        "id": course.id,
                        "name": course.name,
                        "description": course.description,
                        "featured": course.featured,
                    }
                    for course in courses
                ],
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/courses/featured", methods=["GET"])
def get_courses_all_featured():
    courses = models.Courses().query.filter_by(featured=True).all()
    if courses is None:
        return make_response(jsonify({"error": "Courses not found"}), 404)
    return make_response(
        jsonify(
            {
                "data": [
                    {
                        "id": course.id,
                        "name": course.name,
                        "description": course.description,
                        "featured": course.featured,
                    }
                    for course in courses
                ],
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/courses/me", methods=["GET"])
@jwt_required()
def get_courses_me():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    user = models.User().query.filter_by(username=username).first()
    courses = models.CoursesTaken().query.filter_by(id_user=user.id).all()
    if courses is None:
        return make_response(jsonify({"error": "Courses not found"}), 404)

    return make_response(
        jsonify(
            {
                "data": [
                    {
                        "username": username,
                        "id_course": course.id_course,
                        "start_date": course.start_date,
                        "end_date": course.end_date,
                        "section_number": course.section_number,
                        "completed": course.completed,
                    }
                    for course in courses
                ],
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/courses/id", methods=["POST"])
@jwt_required()
def get_course_id():

    id = request.json["data"]["id"]
    user = models.User().query.filter_by(username=id).first()
    if user is None:
        return make_response(jsonify({"error": "User not found"}), 404)

    courses = models.CoursesTaken().query.filter_by(id_user=user.id).all()
    if courses is None:
        return make_response(jsonify({"error": "Courses not found"}), 404)

    return make_response(
        jsonify(
            {
                "data": [
                    {
                        "username": user.username,
                        "id_course": course.id_course,
                        "start_date": course.start_date,
                        "end_date": course.end_date,
                        "section_number": course.section_number,
                        "completed": course.completed,
                    }
                    for course in courses
                ],
                "error": None,
            }
        ),
        200,
    )


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

    check_exist = (
        models.CoursesTaken()
        .query.filter_by(id_user=user.id, id_course=course_wanted)
        .first()
    )
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

    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)

    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

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

    check_exist = (
        models.CoursesTaken()
        .query.filter_by(id_user=user.id, id_course=course_wanted)
        .first()
    )
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

    if course_wanted is None:
        return make_response(jsonify({"error": "Course does not exist"}), 403)

    course_query = models.Courses().query.filter_by(id=course_wanted).first()

    if course_query is None:
        return make_response(jsonify({"error": "Course not found"}), 404)

    course_to_close = (
        models.CoursesTaken()
        .query.filter_by(id_user=user.id, id_course=course_wanted)
        .first()
    )
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

    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)

    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

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

    course_to_close = (
        models.CoursesTaken()
        .query.filter_by(id_user=user.id, id_course=course_wanted)
        .first()
    )
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


@routes.route("/api/lessons", methods=["POST"])
@jwt_required()
def create_lesson():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    course = (
        models.Courses().query.filter_by(id=request.json["data"]["id_course"]).first()
    )
    if course is None:
        return make_response(jsonify({"error": "Course not found"}), 404)

    new_lesson = models.Lessons(
        name=request.json["data"]["name"],
        description=request.json["data"]["description"],
        id_course=request.json["data"]["id_course"],
        type=request.json["data"]["type"],
        number_of_answers=request.json["data"]["number_of_answers"],
    )

    new_lesson.add()

    return make_response(
        jsonify(
            {
                "data": {
                    "name": new_lesson.name,
                    "description": new_lesson.description,
                    "id_course": new_lesson.id_course,
                    "type": new_lesson.type,
                    "number_of_answers": new_lesson.number_of_answers,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/lessons", methods=["PATCH"])
@jwt_required()
def edit_lesson():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    lesson_id = request.json["data"]["lesson_id"]
    lesson_edit = models.Lessons().query.filter_by(id=lesson_id).first()

    to_commit = False
    if request.json["data"]["name"] != "None":
        lesson_edit.name = request.json["data"]["name"]
        to_commit = True

    if request.json["data"]["description"] != "None":
        lesson_edit.description = request.json["data"]["description"]
        to_commit = True

    if request.json["data"]["id_course"] != "None":
        lesson_edit.id_course = request.json["data"]["id_course"]
        to_commit = True

    if request.json["data"]["type"] != "None":
        lesson_edit.type = request.json["data"]["type"]
        to_commit = True

    if request.json["data"]["number_of_answers"] != "None":
        lesson_edit.number_of_answers = request.json["data"]["number_of_answers"]
        to_commit = True

    if to_commit is True:
        db.session.commit()

    return make_response(
        jsonify(
            {
                "data": {
                    "name": lesson_edit.name,
                    "description": lesson_edit.description,
                    "id_course": lesson_edit.id_course,
                    "type": lesson_edit.type,
                    "number_of_answers": lesson_edit.number_of_answers,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/lessons", methods=["DELETE"])
@jwt_required()
def delete_lesson():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    id_lesson = request.json["data"]["id_lesson"]
    # change this after add sections + find better option to save completed courses

    models.Answers().query.filter_by(id_lesson=id_lesson).delete()
    models.Lessons().query.filter_by(id=id_lesson).delete()

    db.session.commit()

    return make_response(jsonify({"data": {"id": id_lesson}, "error": None,}), 200,)


@routes.route("/api/lessons", methods=["GET"])
@jwt_required()
def get_lessons():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    lessons = (
        models.Lessons()
        .query.filter_by(id_course=request.json["data"]["id_course"])
        .all()
    )
    if lessons is None:
        return make_response(jsonify({"error": "Lessons not found"}), 404)

    return make_response(
        jsonify(
            {
                "data": [
                    {
                        "name": lesson.name,
                        "description": lesson.description,
                        "id_course": lesson.id_course,
                        "type": lesson.type,
                        "number_of_answers": lesson.number_of_answers,
                    }
                    for lesson in lessons
                ],
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/answers", methods=["PATCH"])
@jwt_required()
def create_answer():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    lesson = (
        models.Lessons().query.filter_by(id=request.json["data"]["id_lesson"]).first()
    )
    if lesson is None:
        return make_response(jsonify({"error": "Lesson not found"}), 404)

    new_answer = models.Answers(
        final_answer=request.json["data"]["final_answer"],
        id_lesson=request.json["data"]["id_lesson"],
    )

    new_answer.add()

    return make_response(
        jsonify(
            {
                "data": {
                    "id": new_answer.id,
                    "final_answer": new_answer.final_answer,
                    "id_lesson": new_answer.id_lesson,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/answers", methods=["POST"])
@jwt_required()
def check_answer():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    id_lesson = request.json["data"]["id_lesson"]
    answers = models.Answers().query.filter_by(id_lesson=id_lesson).all()

    answer_valid = None
    status = False
    length_of_answers = len(answers)
    if length_of_answers > 1:
        for answer in answers:
            if answer.final_answer == request.json["data"]["answer"]:
                status = True
                answer_valid = answer
                break
    elif length_of_answers == 1:
        if answers[0].final_answer == request.json["data"]["answer"]:
            status = True
            answer_valid = answers[0]
    else:
        return make_response(jsonify({"error": {"id": id_lesson},}), 404)

    if status == False:
        return make_response(
            jsonify(
                {"data": {"status": status, "id_lesson": id_lesson,}, "error": None,}
            ),
            200,
        )

    return make_response(
        jsonify(
            {
                "data": {
                    "id": answer_valid.id,
                    "status": status,
                    "id_lesson": answer_valid.id_lesson,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/answers", methods=["PATCH"])
@jwt_required()
def edit_answer():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    id_answer = request.json["data"]["id_answer"]
    answer_edit = models.Answers().query.filter_by(id=id_answer).first()

    if answer_edit is None:
        return make_response(jsonify({"error": "Answer not found"}), 404)

    to_commit = False
    if request.json["data"]["final_answer"] != "None":
        answer_edit.final_answer = request.json["data"]["final_answer"]
        to_commit = True

    if request.json["data"]["id_lesson"] != "None":
        answer_edit.id_lesson = request.json["data"]["id_lesson"]
        to_commit = True

    if to_commit is True:
        db.session.commit()

    return make_response(
        jsonify(
            {
                "data": {
                    "id": id_answer,
                    "final_answer": answer_edit.final_answer,
                    "id_lesson": answer_edit.id_lesson,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/answers", methods=["DELETE"])
@jwt_required()
def delete_answer():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    id_answer = request.json["data"]["id_answer"]
    # change this after add sections + find better option to save completed courses

    models.Answers().query.filter_by(id=id_answer).delete()

    db.session.commit()

    return make_response(jsonify({"data": {"id": id_answer}, "error": None,}), 200,)


@routes.route("/api/answers", methods=["GET"])
@jwt_required()
def get_answers():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    answers = (
        models.Answers()
        .query.filter_by(id_lesson=request.json["data"]["id_lesson"])
        .all()
    )
    if answers is None:
        return make_response(jsonify({"error": "Answers not found"}), 404)

    return make_response(
        jsonify(
            {
                "data": [
                    {
                        "id": answer.id,
                        "final_answer": answer.final_answer,
                        "id_lesson": answer.id_lesson,
                    }
                    for answer in answers
                ],
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/comments", methods=["POST"])
@jwt_required()
def create_comment():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)

    lesson = (
        models.Lessons().query.filter_by(id=request.json["data"]["id_lesson"]).first()
    )
    if lesson is None:
        return make_response(jsonify({"error": "Lesson not found"}), 404)

    user_index = models.User().query.filter_by(username=username).first()

    new_comment = models.Comments(
        user_id=user_index.id,
        id_lesson=request.json["data"]["id_lesson"],
        data_published=datetime.now(),
        content=request.json["data"]["content"],
    )

    new_comment.add()

    return make_response(
        jsonify(
            {
                "data": {
                    "id": new_comment.id,
                    "user_id": new_comment.user_id,
                    "id_lesson": new_comment.id_lesson,
                    "data_published": new_comment.data_published,
                    "content": new_comment.content,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/comments", methods=["PATCH"])
@jwt_required()
def edit_comment():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    comment_id = request.json["data"]["id"]
    comment_edit = models.Comments().query.filter_by(id=comment_id).first()

    to_commit = False
    if request.json["data"]["content"] != "None":
        comment_edit.content = request.json["data"]["content"]
        to_commit = True

    if to_commit is True:
        db.session.commit()

    return make_response(
        jsonify(
            {
                "data": {
                    "id": comment_edit.id,
                    "user_id": comment_edit.user_id,
                    "id_lesson": comment_edit.id_lesson,
                    "data_published": comment_edit.data_published,
                    "content": comment_edit.content,
                },
                "error": None,
            }
        ),
        200,
    )


@routes.route("/api/comments", methods=["DELETE"])
@jwt_required()
def delete_comment():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    if models.User().query.filter_by(username=username).first().role_id != ADMIN_ID:
        return make_response(jsonify({"error": "Access is denied"}), 403)

    id_comment = request.json["data"]["id_comment"]
    # change this after add sections + find better option to save completed courses

    models.Comments().query.filter_by(id=id_comment).delete()

    db.session.commit()

    return make_response(jsonify({"data": {"id": id_comment}, "error": None,}), 200,)


@routes.route("/api/comments", methods=["GET"])
@jwt_required()
def get_comments():
    username = get_jwt()["sub"]
    if username is None:
        return make_response(jsonify({"error": "Bad token"}), 403)
    comments = (
        models.Comments()
        .query.filter_by(id_lesson=request.json["data"]["id_lesson"])
        .all()
    )
    if comments == None:
        return make_response(jsonify({"error": "Comments not found"}), 404)

    return make_response(
        jsonify(
            {
                "data": [
                    {
                        "id": comment.id,
                        "user_id": comment.user_id,
                        "id_lesson": comment.id_lesson,
                        "data_published": comment.data_published,
                        "content": comment.content,
                    }
                    for comment in comments
                ],
                "error": None,
            }
        ),
        200,
    )

