from typing import Union
from fastapi import APIRouter, Depends, status, Path, Query
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.schemas.dynamic_course import (
    DynamicCourseCreateRequest,
    DynamicCourseSurveyAnswerCreateRequest,
    DynamicCourseSurveyAnswerCreateResponse,
    DynamicCourseSurveyQuestionCreateRequest,
    DynamicCourseSurveyQuestionCreateResponse,
    DynamicCourseSurveyCreateRequest,
    DynamicCourseSurveyCreateResponse,
    DynamicCourseSurveyUserResultsCreateRequest,
)
from app.routers import deps
from app import models

from app.settings import ADMIN_ID

router = APIRouter()


@router.post(
    "/dynamic-courses/surveys",
    tags=["dynamic-courses"],
    response_model=DynamicCourseSurveyCreateResponse,
)
def create_dynamic_course_survey(
    request_data: DynamicCourseSurveyCreateRequest,
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

    survey = models.DynamicCourseSurvey(
        name=request_data.data.name,
    )
    db.add(survey)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": survey.id,
                "name": survey.name,
            }
        },
    )


@router.post(
    "/dynamic-courses/surveys/questions",
    tags=["dynamic-courses"],
    response_model=DynamicCourseSurveyQuestionCreateResponse,
)
def create_dynamic_course_survey_question(
    request_data: DynamicCourseSurveyQuestionCreateRequest,
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

    survey_question = models.DynamicCourseSurveyQuestions(
        question=request_data.data.question,
        survey_id=request_data.data.survey_id,
    )
    db.add(survey_question)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": survey_question.id,
                "survey_id": survey_question.survey_id,
                "question": survey_question.question,
            }
        },
    )


@router.get(
    "/dynamic-courses/surveys/{survey_id}",
    tags=["dynamic-courses"],
)
def get_dynamic_course_survey_by_id(
    survey_id: int = Path(title="id of the survey"),
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
    survey = (
        db.query(models.DynamicCourseSurvey)
        .filter_by(
            id=survey_id,
        )
        .join(
            models.DynamicCourseSurveyQuestions,
            models.DynamicCourseSurveyQuestions.survey_id
            == models.DynamicCourseSurvey.id,
        )
        .join(
            models.DynamicCourseSurveyAnswers,
            models.DynamicCourseSurveyAnswers.question_id
            == models.DynamicCourseSurveyQuestions.id,
        )
        .first()
    )
    if survey is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Survey not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": survey.id,
                "name": survey.name,
                "questions": [
                    {
                        "question_id": survey_question.id,
                        "question": survey_question.question,
                        "answers": [
                            {
                                "answer_id": survey_answer.id,
                                "name": survey_answer.name,
                                "rule_type": survey_answer.rule_type,
                                "rule_value": survey_answer.rule_value,
                            }
                            for survey_answer in survey_question.answers
                        ],
                    }
                    for survey_question in survey.questions
                ],
            }
        },
    )


@router.post(
    "/dynamic-courses/surveys/answers",
    tags=["dynamic-courses"],
    response_model=DynamicCourseSurveyAnswerCreateResponse,
)
def create_dynamic_course_survey_answer(
    request_data: DynamicCourseSurveyAnswerCreateRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    rule_type = 0
    rule_value = 0
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
    question = (
        db.query(models.DynamicCourseSurveyQuestions)
        .filter_by(id=request_data.data.question_id)
        .first()
    )

    if question is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Question for question_id not found"},
        )

    # if rule_type and rule_value is 0, then skip lesson for this question
    # if rule_type and rule_value is 1, select lesson_id for this question
    if request_data.data.rule_type == 0:
        rule_type = 0
        rule_value = 0
    elif request_data.data.rule_type == 1:
        rule_type = 1
        lesson = (
            db.query(models.Lessons).filter_by(id=request_data.data.rule_value).first()
        )
        if lesson is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Lesson for rule_value not found"},
            )
        rule_value = lesson.id

    question_answer = models.DynamicCourseSurveyAnswers(
        question_id=question.id,
        name=request_data.data.name,
        rule_type=rule_type,
        rule_value=rule_value,
    )
    db.add(question_answer)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "id": question_answer.id,
            "question_id": question_answer.question_id,
            "name": question_answer.name,
            "rule_type": question_answer.rule_type,
            "rule_value": question_answer.rule_value,
        },
    )


@router.post(
    "/dynamic-courses/surveys/user/answers",
    tags=["dynamic-courses"],
    response_model=DynamicCourseSurveyQuestionCreateResponse,
)
def create_dynamic_course_survey_user_results(
    request_data: DynamicCourseSurveyUserResultsCreateRequest,
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
    survey = (
        db.query(models.DynamicCourseSurvey)
        .filter_by(id=request_data.data.survey_id)
        .first()
    )
    if survey is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Survey not found"},
        )
    for survey_results in request_data.data.survey_results:
        question = (
            db.query(models.DynamicCourseSurveyQuestions)
            .filter_by(
                id=survey_results.question_id, survey_id=request_data.data.survey_id
            )
            .first()
        )
        if question is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Question for question_id not found"},
            )
        answer = (
            db.query(models.DynamicCourseSurveyAnswers)
            .filter_by(
                id=survey_results.answer_id, question_id=survey_results.question_id
            )
            .first()
        )
        if answer is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Answer for answer_id not found"},
            )
        survey_result = models.DynamicCourseSurveyUserResults(
            user_id=user.id,
            survey_id=survey.id,
            question_id=survey_results.question_id,
            answer_id=survey_results.answer_id,
        )
        db.add(survey_result)
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": [
                {
                    "question_id": survey_results.question_id,
                    "answer_id": survey_results.answer_id,
                }
                for survey_results in request_data.data.survey_results
            ]
        },
    )


@router.get(
    "/dynamic-courses/surveys/{survey_id}/user/results",
    tags=["dynamic-courses"],
)
def get_dynamic_course_survey_user_results(
    survey_id: int = Path(title="id of the survey"),
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
    survey_results = (
        db.query(models.DynamicCourseSurveyUserResults)
        .filter_by(survey_id=survey_id, user_id=user.id)
        .all()
    )

    if survey_results is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Survey results not found"},
        )
    # TODO:  delete maybe?
    # if populate:
    #     return JSONResponse(
    #         status_code=status.HTTP_200_OK,
    #         content={
    #             "data": [
    #                 {
    #                     "id": result.id,
    #                     "survey": {
    #                         "id": result.survey.id,
    #                         "name": result.survey.name,
    #                         "questions": [
    #                             {
    #                                 "id": survey_question.id,
    #                                 "question": survey_question.question,
    #                                 "answers": [
    #                                     {
    #                                         "id": survey_answer.id,
    #                                         "name": survey_answer.name,
    #                                     }
    #                                     for survey_answer in survey_question.answers
    #                                 ],
    #                             }
    #                             for survey_question in result.survey.questions
    #                         ],
    #                     },
    #                 }
    #             ]
    #             for result in survey_results
    #         },
    #     )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "survey_id": result.survey_id,
                    "user_id": result.user_id,
                    "question_id": result.question_id,
                    "answer_id": result.answer_id,
                }
                for result in survey_results
            ]
        },
    )


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
            lessons_list.append(lesson)
            lessons_found = True
    if lessons_found:
        dynamic_course = models.DynamicCourses(
            name=request_data.data.name,
            user_id=user.id,
        )
        db.add(dynamic_course)
        db.commit()
        for lesson in lessons_list:
            dynamic_lesson = models.DynamicLessons(
                dynamic_course_id=dynamic_course.id,
                lesson_id=lesson.id,
            )
            db.add(dynamic_lesson)
            db.commit()

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={"data": {"id": dynamic_course.id, "name": dynamic_course.name}},
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
