from typing import Union
from fastapi import APIRouter, Depends, status, Path, Query
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.schemas.dynamic_course import (
    DynamicCourseCreateRequest,
)
from app.routers import deps
from app import models

from app.settings import ADMIN_ID

router = APIRouter()


@router.post(
    "/dynamic-courses",
    tags=["dynamic-courses"],
)
def create_dynamic_course_from_survey_user_results(
    request_data: DynamicCourseCreateRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )
    survey_results = (
        db.query(models.DynamicCourseSurveyUserResults)
        .filter_by(survey_id=request_data.data.survey_id, user_id=user.id)
        .all()
    )
    if survey_results is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Survey results not found"},
        )

    lessons_list = []
    lessons_found = False
    for survey_result in survey_results:
        survey_answer = (
            db.query(models.DynamicCourseSurveyAnswers)
            .filter_by(
                id=survey_result.answer_id,
                question_id=survey_result.question_id,
                rule_type=1,
            )
            .first()
        )
        if survey_answer:
            lesson = (
                db.query(models.Lessons).filter_by(id=survey_answer.rule_value).first()
            )
            if lesson is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Lesson for answer_id not found"},
                )
            if lesson not in lessons_list:
                lessons_list.append(lesson)
                lessons_found = True
    if lessons_found:
        new_dynamic_course = models.DynamicCourses(
            name=request_data.data.name,
            user_id=user.id,
        )
        db.add(new_dynamic_course)
        db.commit()
        for lesson in lessons_list:
            new_dynamic_lesson = models.DynamicLessons(
                dynamic_course_id=new_dynamic_course.id,
                lesson_id=lesson.id,
            )
            db.add(new_dynamic_lesson)
            db.commit()

        dynamic_course = (
            db.query(models.DynamicCourses)
            .filter_by(id=new_dynamic_course.id, user_id=user.id)
            .first()
        )
        dynamic_lessons = (
            db.query(models.DynamicLessons)
            .filter_by(dynamic_course_id=dynamic_course.id)
            .join(models.Lessons, models.DynamicLessons.lesson_id == models.Lessons.id)
            .add_columns(
                models.DynamicLessons.id,
                models.DynamicLessons.dynamic_course_id,
                models.Lessons.id.label("lesson_id"),
                models.Lessons.name.label("lesson_name"),
                models.Lessons.description.label("lesson_description"),
                models.Lessons.type.label("lesson_type"),
                models.Lessons.number_of_answers.label("lesson_number_of_answers"),
            )
            .group_by(models.DynamicLessons.id)
            .all()
        )
        if dynamic_lessons is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Dynamic lessons not found"},
            )

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "data": {
                    "id": dynamic_course.id,
                    "name": dynamic_course.name,
                    "lessons": [
                        {
                            "id": dynamic_lesson.id,
                            "lesson_id": dynamic_lesson.lesson_id,
                            "name": dynamic_lesson.lesson_name,
                            "description": dynamic_lesson.lesson_description,
                            "type": dynamic_lesson.lesson_type,
                            "number_of_answers": dynamic_lesson.lesson_number_of_answers,
                        }
                        for dynamic_lesson in dynamic_lessons
                    ],
                },
            },
        )
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": "No lessons found"},
    )


@router.get(
    "/dynamic-courses",
    tags=["dynamic-courses"],
)
def get_all_dynamic_courses(
    populate: Union[bool, None] = Query(default=False),
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )

    if populate:
        dynamic_courses = (
            db.query(models.DynamicCourses).filter_by(user_id=user.id).all()
        )
        if dynamic_courses is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Dynamic courses not found"},
            )
        dynamic_courses_populated = []
        for dynamic_course in dynamic_courses:
            dynamic_lessons = (
                db.query(models.DynamicLessons)
                .filter_by(dynamic_course_id=dynamic_course.id)
                .join(
                    models.Lessons, models.DynamicLessons.lesson_id == models.Lessons.id
                )
                .add_columns(
                    models.DynamicLessons.id,
                    models.DynamicLessons.dynamic_course_id,
                    models.Lessons.id.label("lesson_id"),
                    models.Lessons.name.label("lesson_name"),
                    models.Lessons.description.label("lesson_description"),
                    models.Lessons.type.label("lesson_type"),
                    models.Lessons.number_of_answers.label("lesson_number_of_answers"),
                )
                .group_by(models.DynamicLessons.id)
                .all()
            )
            if dynamic_lessons is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Dynamic lessons not found"},
                )

            dynamic_courses_populated.append(
                {
                    "id": dynamic_course.id,
                    "name": dynamic_course.name,
                    "lessons": [
                        {
                            "id": dynamic_lesson.id,
                            "lesson_id": dynamic_lesson.lesson_id,
                            "name": dynamic_lesson.lesson_name,
                            "description": dynamic_lesson.lesson_description,
                            "type": dynamic_lesson.lesson_type,
                            "number_of_answers": dynamic_lesson.lesson_number_of_answers,
                        }
                        for dynamic_lesson in dynamic_lessons
                    ],
                }
            )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": dynamic_courses_populated,
            },
        )

    dynamic_courses = db.query(models.DynamicCourses).filter_by(user_id=user.id).all()
    if dynamic_courses is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Dynamic courses not found"},
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "id": dynamic_course.id,
                    "name": dynamic_course.name,
                    "lessons": [
                        {
                            "id": dynamic_lesson.id,
                            "lesson_id": dynamic_lesson.lesson_id,
                        }
                        for dynamic_lesson in dynamic_course.dynamic_lessons
                    ],
                }
                for dynamic_course in dynamic_courses
            ]
        },
    )


@router.get(
    "/dynamic-courses/{dynamic_course_id}",
    tags=["dynamic-courses"],
)
def get_dynamic_course_by_id(
    dynamic_course_id: int = Path(title="id of the dynamic course"),
    populate: Union[bool, None] = Query(default=False),
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )

    if populate:
        dynamic_course = (
            db.query(models.DynamicCourses)
            .filter_by(id=dynamic_course_id, user_id=user.id)
            .first()
        )
        if dynamic_course is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Dynamic course not found"},
            )
        dynamic_lessons = (
            db.query(models.DynamicLessons)
            .filter_by(dynamic_course_id=dynamic_course.id)
            .join(models.Lessons, models.DynamicLessons.lesson_id == models.Lessons.id)
            .add_columns(
                models.DynamicLessons.id,
                models.DynamicLessons.dynamic_course_id,
                models.Lessons.id.label("lesson_id"),
                models.Lessons.name.label("lesson_name"),
                models.Lessons.description.label("lesson_description"),
                models.Lessons.type.label("lesson_type"),
                models.Lessons.number_of_answers.label("lesson_number_of_answers"),
            )
            .group_by(models.DynamicLessons.id)
            .all()
        )
        if dynamic_lessons is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Dynamic lessons not found"},
            )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "id": dynamic_course.id,
                    "name": dynamic_course.name,
                    "lessons": [
                        {
                            "id": dynamic_lesson.id,
                            "lesson_id": dynamic_lesson.lesson_id,
                            "name": dynamic_lesson.lesson_name,
                            "description": dynamic_lesson.lesson_description,
                            "type": dynamic_lesson.lesson_type,
                            "number_of_answers": dynamic_lesson.lesson_number_of_answers,
                        }
                        for dynamic_lesson in dynamic_lessons
                    ],
                },
            },
        )

    dynamic_course = (
        db.query(models.DynamicCourses)
        .filter_by(id=dynamic_course_id, user_id=user.id)
        .first()
    )
    if dynamic_course is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Dynamic course not found"},
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": dynamic_course.id,
                "name": dynamic_course.name,
                "lessons": [
                    {
                        "id": dynamic_lesson.id,
                        "lesson_id": dynamic_lesson.lesson_id,
                    }
                    for dynamic_lesson in dynamic_course.dynamic_lessons
                ],
            }
        },
    )


@router.delete("/dynamic-courses/{dynamic_course_id}", tags=["dynamic-courses"])
def delete_dynamic_course(
    dynamic_course_id: int = Path(title="id of the dynamic course to delete"),
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )

    user = db.query(models.User).filter_by(username=username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )
    if db.query(models.User).filter_by(username=username).first().role_id != ADMIN_ID:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )

    db.query(models.DynamicLessons).filter_by(
        dynamic_course_id=dynamic_course_id
    ).delete()
    db.query(models.DynamicCourses).filter_by(id=dynamic_course_id).delete()
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": dynamic_course_id,
            },
            "error": None,
        },
    )
