from typing import Union
from fastapi import APIRouter, Depends, status, Path, Query
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.schemas.dynamic_course import DynamicCourseCreateRequest
from app.routers import deps
from app import models, crud
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
    lessons_list = []
    lessons_found = False

    if request_data.data.survey_id:
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
                    db.query(models.Lessons)
                    .filter_by(id=survey_answer.rule_value)
                    .first()
                )
                if lesson is None:
                    return JSONResponse(
                        status_code=status.HTTP_404_NOT_FOUND,
                        content={"error": "Lesson for answer_id not found"},
                    )
                if lesson not in lessons_list:
                    lessons_list.append(lesson)
                    lessons_found = True

    if request_data.data.knowledge_test_id:
        global_knowledge_test_results = (
            db.query(models.KnowledgeTestUserResults)
            .filter_by(
                knowledge_test_id=request_data.data.knowledge_test_id, user_id=user.id
            )
            .all()
        )
        if global_knowledge_test_results is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Knowledge test results not found"},
            )

        for global_knowledge_test_result in global_knowledge_test_results:
            global_knowledge_test = (
                db.query(models.KnowledgeTest)
                .filter_by(id=global_knowledge_test_result.knowledge_test_id)
                .first()
            )
            if global_knowledge_test is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Knowledge test not found"},
                )
            lesson = (
                db.query(models.Lessons)
                .filter_by(id=global_knowledge_test.lesson_id)
                .first()
            )
            if lesson is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Lesson for knowledge test not found"},
                )
            if lesson not in lessons_list:
                lessons_list.append(lesson)
                lessons_found = True

    if request_data.data.knowledge_test_ids:
        for knowledge_test_id in request_data.data.knowledge_test_ids:
            global_knowledge_test = (
                db.query(models.KnowledgeTest).filter_by(id=knowledge_test_id).first()
            )
            if global_knowledge_test is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Knowledge test not found"},
                )
            lesson = (
                db.query(models.Lessons)
                .filter_by(id=global_knowledge_test.lesson_id)
                .first()
            )
            if lesson is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Lesson for knowledge test not found"},
                )
            if lesson not in lessons_list:
                lessons_list.append(lesson)
                lessons_found = True

    if request_data.data.global_knowledge_test_id:
        global_knowledge_test_results = (
            db.query(models.GlobalKnowledgeTestUserResults)
            .filter_by(
                global_knowledge_test_id=request_data.data.global_knowledge_test_id,
                user_id=user.id,
                is_correct=False,
            )
            .all()
        )
        if global_knowledge_test_results is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Global Knowledge test results not found"},
            )

        for global_knowledge_test_result in global_knowledge_test_results:
            global_knowledge_test = (
                db.query(models.GlobalKnowledgeTest)
                .filter_by(id=global_knowledge_test_result.global_knowledge_test_id)
                .first()
            )
            if global_knowledge_test is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Global Knowledge test not found"},
                )
            global_knowledge_test_questions = (
                db.query(models.GlobalKnowledgeTestQuestions)
                .filter_by(global_knowledge_test_id=global_knowledge_test.id)
                .all()
            )
            if global_knowledge_test_questions is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Global Knowledge test questions not found"},
                )
            for global_knowledge_test_question in global_knowledge_test_questions:
                lesson = (
                    db.query(models.Lessons)
                    .filter_by(id=global_knowledge_test_question.lesson_id)
                    .first()
                )
                if lesson is None:
                    return JSONResponse(
                        status_code=status.HTTP_404_NOT_FOUND,
                        content={"error": "Lesson for knowledge test not found"},
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
                user_id=user.id,
                completed=False,
                start_date=None,
                end_date=None,
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
                    "user_id": dynamic_course.user_id,
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

    try:
        all_dynamic_courses = crud.dynamic_courses.get_all_dynamic_courses(
            db, user, populate
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": all_dynamic_courses},
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
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

    try:
        dynamic_course = crud.dynamic_courses.get_dynamic_course_by_id(
            db, user, dynamic_course_id, populate
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": dynamic_course},
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
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


@router.get(
    "/dynamic-courses/{dynamic_course_id}/dynamic-lessons/{dynamic_lesson_id}",
    tags=["dynamic-courses"],
)
def get_dynamic_lesson_by_id(
    dynamic_course_id: int = Path(title="id of the dynamic course"),
    dynamic_lesson_id: int = Path(title="id of the dynamic lesson"),
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

    try:
        dynamic_lesson = crud.dynamic_courses.get_dynamic_lesson_by_id(
            db, user, dynamic_course_id, dynamic_lesson_id
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": dynamic_lesson},
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )
