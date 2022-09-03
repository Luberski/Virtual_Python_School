from fastapi import APIRouter, Depends, status, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.schemas.dynamic_course import (
    DynamicCourseSurveyAnswerCreateRequest,
    DynamicCourseSurveyQuestionCreateRequest,
    DynamicCourseSurveyQuestionCreateResponse,
    DynamicCourseSurveyCreateRequest,
    DynamicCourseSurveyCreateResponse,
    DynamicCourseSurveyUserResultsCreateRequest,
    DynamicCourseSurveyWithAnswersCreateRequest,
)
from app.routers import deps
from app import models

from app.settings import ADMIN_ID

router = APIRouter()


@router.post(
    "/surveys",
    tags=["surveys"],
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
        featured=request_data.data.featured,
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
    "/surveys/questions",
    tags=["surveys"],
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

    if request_data.data.bulk and request_data.data.questions:
        questions = []
        for question_item in request_data.data.questions:
            question_ = models.DynamicCourseSurveyQuestions(
                question=question_item,
                survey_id=request_data.data.survey_id,
            )
            questions.append(question_)
            db.add(question_)
            db.commit()
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "data": {
                    "survey_id": request_data.data.survey_id,
                    "questions": [
                        {
                            "id": question.id,
                            "question": question.question,
                        }
                        for question in questions
                    ],
                }
            },
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
    "/surveys/{survey_id}",
    tags=["surveys"],
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
                "featured": survey.featured,
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


@router.get(
    "/surveys",
    tags=["surveys"],
)
def get_dynamic_course_surveys(
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

    surveys = (
        db.query(models.DynamicCourseSurvey)
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
        .all()
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "id": survey.id,
                    "name": survey.name,
                    "featured": survey.featured,
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
                for survey in surveys
            ]
        },
    )


@router.get(
    "/survey/featured",
    tags=["surveys"],
)
def get_dynamic_course_survey_featured(
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
            featured=True,
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
                "featured": survey.featured,
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
    "/surveys/answers",
    tags=["surveys"],
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

    if request_data.data.bulk and request_data.data.answers:
        answers_list = []
        for answer_item in request_data.data.answers:
            # if rule_type and rule_value is 0, then skip lesson for this question
            # if rule_type is 1, then rule_value is lesson_id for this question
            if answer_item.rule_type == 0:
                rule_type = 0
                rule_value = 0
            elif answer_item.rule_type == 1:
                rule_type = 1
                lesson = (
                    db.query(models.Lessons)
                    .filter_by(id=answer_item.rule_value)
                    .first()
                )
                if lesson is None:
                    return JSONResponse(
                        status_code=status.HTTP_404_NOT_FOUND,
                        content={"error": "Lesson for rule_value not found"},
                    )
                rule_value = lesson.id
            answer_ = models.DynamicCourseSurveyAnswers(
                question_id=question.id,
                name=answer_item.name,
                rule_type=rule_type,
                rule_value=rule_value,
            )
            answers_list.append(answer_)
            db.add(answer_)
            db.commit()
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "data": {
                    "question_id": question.id,
                    "answers": [
                        {
                            "id": answer.id,
                            "name": answer.name,
                            "rule_type": answer.rule_type,
                            "rule_value": answer.rule_value,
                        }
                        for answer in answers_list
                    ],
                }
            },
        )
    else:
        # if rule_type and rule_value is 0, then skip lesson for this question
        # if rule_type is 1, then rule_value is lesson_id for this question
        if request_data.data.rule_type == 0:
            rule_type = 0
            rule_value = 0
        elif request_data.data.rule_type == 1:
            rule_type = 1
            lesson = (
                db.query(models.Lessons)
                .filter_by(id=request_data.data.rule_value)
                .first()
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
                "data": {
                    "id": question_answer.id,
                    "question_id": question_answer.question_id,
                    "name": question_answer.name,
                    "rule_type": question_answer.rule_type,
                    "rule_value": question_answer.rule_value,
                },
            },
        )


@router.post(
    "/surveys/question",
    tags=["surveys"],
)
def create_dynamic_course_survey_question_with_answers(
    request_data: DynamicCourseSurveyWithAnswersCreateRequest,
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

    survey_question = models.DynamicCourseSurveyQuestions(
        question=request_data.data.question,
        survey_id=request_data.data.survey_id,
    )
    db.add(survey_question)
    db.commit()

    answers_list = []
    for answer_item in request_data.data.answers:
        # if rule_type and rule_value is 0, then skip lesson for this question
        # if rule_type is 1, then rule_value is lesson_id for this question
        if answer_item.rule_type == 0:
            rule_type = 0
            rule_value = 0
        elif answer_item.rule_type == 1:
            rule_type = 1
            lesson = (
                db.query(models.Lessons).filter_by(id=answer_item.rule_value).first()
            )
            if lesson is None:
                return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"error": "Lesson for rule_value not found"},
                )
            rule_value = lesson.id
        answer_ = models.DynamicCourseSurveyAnswers(
            question_id=survey_question.id,
            name=answer_item.name,
            rule_type=rule_type,
            rule_value=rule_value,
        )
        answers_list.append(answer_)
        db.add(answer_)
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": survey_question.id,
                "answers": [
                    {
                        "id": answer.id,
                        "question_id": survey_question.id,
                        "name": answer.name,
                        "rule_type": answer.rule_type,
                        "rule_value": answer.rule_value,
                    }
                    for answer in answers_list
                ],
            }
        },
    )


@router.post(
    "/surveys/user/answers",
    tags=["surveys"],
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
    "/surveys/{survey_id}/user/results",
    tags=["surveys"],
)
def get_dynamic_course_survey_user_results(
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
