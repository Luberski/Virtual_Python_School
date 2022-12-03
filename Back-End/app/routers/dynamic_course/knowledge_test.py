from fastapi import APIRouter, Depends, status, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.schemas.knowledge_test import (
    KnowledgeTestCreateRequest,
    KnowledgeTestQuestionsCreateRequest,
    KnowledgeTestUserResultsCreateRequest,
)
from app.routers import deps
from app import models

from app.settings import ADMIN_ID

router = APIRouter()


@router.post(
    "/knowledgetests",
    tags=["knowledgetests"],
)
def create_knowledgetest(
    request_data: KnowledgeTestCreateRequest,
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

    knowledgetest = models.KnowledgeTest(
        name=request_data.data.name,
        lesson_id=request_data.data.lesson_id,
    )
    db.add(knowledgetest)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": knowledgetest.id,
                "name": knowledgetest.name,
                "lesson_id": knowledgetest.lesson_id,
            }
        },
    )


@router.post(
    "/knowledgetests/questions",
    tags=["knowledgetests"],
)
def create_knowledgetest_question(
    request_data: KnowledgeTestQuestionsCreateRequest,
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
            question_ = models.KnowledgeTestQuestions(
                question=question_item,
                answer=request_data.data.answer,
                knowledge_test_id=request_data.data.knowledge_test_id,
            )
            questions.append(question_)
            db.add(question_)
            db.commit()
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "data": {
                    "knowledge_test_id": request_data.data.knowledge_test_id,
                    "questions": [
                        {
                            "id": question.id,
                            "question": question.question,
                            "answer": question.answer,
                        }
                        for question in questions
                    ],
                }
            },
        )
    knowledgetest_question = models.KnowledgeTestQuestions(
        question=request_data.data.question,
        answer=request_data.data.answer,
        knowledge_test_id=request_data.data.knowledge_test_id,
    )
    db.add(knowledgetest_question)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": knowledgetest_question.id,
                "knowledge_test_id": knowledgetest_question.knowledge_test_id,
                "question": knowledgetest_question.question,
                "answer": knowledgetest_question.answer,
            }
        },
    )


@router.get(
    "/knowledgetests/{knowledge_test_id}",
    tags=["knowledgetests"],
)
def get_knowledgetest_by_id(
    knowledge_test_id: int = Path(title="id of the knowledgetest"),
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
    knowledgetest = (
        db.query(models.KnowledgeTest)
        .filter_by(
            id=knowledge_test_id,
        )
        .join(
            models.KnowledgeTestQuestions,
            models.KnowledgeTestQuestions.knowledge_test_id == models.KnowledgeTest.id,
        )
        .first()
    )
    if knowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": knowledgetest.id,
                "name": knowledgetest.name,
                "lesson_id": knowledgetest.lesson_id,
                "questions": [
                    {
                        "question_id": knowledgetest_question.id,
                        "question": knowledgetest_question.question,
                        "answer": knowledgetest_question.answer,
                    }
                    for knowledgetest_question in knowledgetest.questions
                ],
            }
        },
    )


@router.get(
    "/knowledgetests/lesson/{lesson_id}",
    tags=["knowledgetests"],
)
def get_knowledgetest_by_lession_id(
    lesson_id: int = Path(title="id of the lesson"),
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
    knowledgetest = (
        db.query(models.KnowledgeTest)
        .filter_by(
            lesson_id=lesson_id,
        )
        .join(
            models.KnowledgeTestQuestions,
            models.KnowledgeTestQuestions.knowledge_test_id == models.KnowledgeTest.id,
        )
        .first()
    )
    if knowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": knowledgetest.id,
                "name": knowledgetest.name,
                "lesson_id": knowledgetest.lesson_id,
                "questions": [
                    {
                        "question_id": knowledgetest_question.id,
                        "question": knowledgetest_question.question,
                        "answer": knowledgetest_question.answer,
                    }
                    for knowledgetest_question in knowledgetest.questions
                ],
            }
        },
    )


@router.get(
    "/knowledgetests",
    tags=["knowledgetests"],
)
def get_knowledgetests(
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

    knowledgetests = (
        db.query(models.KnowledgeTest)
        .join(
            models.KnowledgeTestQuestions,
            models.KnowledgeTestQuestions.knowledge_test_id == models.KnowledgeTest.id,
        )
        .all()
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "id": knowledgetest.id,
                    "name": knowledgetest.name,
                    "lesson_id": knowledgetest.lesson_id,
                    "questions": [
                        {
                            "question_id": knowledgetest_question.id,
                            "question": knowledgetest_question.question,
                            "answer": knowledgetest_question.answer,
                        }
                        for knowledgetest_question in knowledgetest.questions
                    ],
                }
                for knowledgetest in knowledgetests
            ]
        },
    )


@router.post(
    "/knowledgetests/user/answers",
    tags=["knowledgetests"],
)
def create_knowledgetest_user_results(
    request_data: KnowledgeTestUserResultsCreateRequest,
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
    knowledgetest = (
        db.query(models.KnowledgeTest)
        .filter_by(id=request_data.data.knowledge_test_id)
        .first()
    )
    if knowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )
    for knowledgetest_results in request_data.data.results:
        question = (
            db.query(models.KnowledgeTestQuestions)
            .filter_by(
                id=knowledgetest_results.question_id,
                knowledge_test_id=request_data.data.knowledge_test_id,
            )
            .first()
        )
        if question is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Question for question_id not found"},
            )
        knowledgetest_result = models.KnowledgeTestUserResults(
            user_id=user.id,
            knowledge_test_id=knowledgetest.id,
            question_id=knowledgetest_results.question_id,
            answer=knowledgetest_results.answer,
            is_correct=knowledgetest_results.answer == question.answer,
        )
        db.add(knowledgetest_result)
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": [
                {
                    "question_id": knowledgetest_results.question_id,
                    "answer": knowledgetest_results.answer,
                }
                for knowledgetest_results in request_data.data.results
            ]
        },
    )


@router.get(
    "/knowledgetests/{knowledge_test_id}/user/results",
    tags=["knowledgetests"],
)
def get_knowledgetest_user_results(
    knowledge_test_id: int = Path(title="id of the knowledgetest"),
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
    knowledgetest_results = (
        db.query(models.KnowledgeTestUserResults)
        .filter_by(knowledge_test_id=knowledge_test_id, user_id=user.id)
        .all()
    )

    if knowledgetest_results is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test results not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "knowledge_test_id": result.knowledge_test_id,
                    "user_id": result.user_id,
                    "question_id": result.question_id,
                    "answer": result.answer,
                }
                for result in knowledgetest_results
            ]
        },
    )


@router.delete("/knowledgetests/{knowledge_test_id}", tags=["knowledgetests"])
def delete_knowledgetest(
    knowledge_test_id: int = Path(title="id of the knowledgetest to delete"),
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

    db.query(models.KnowledgeTestUserResults).filter_by(
        knowledge_test_id=knowledge_test_id
    ).delete()
    db.query(models.KnowledgeTestQuestions).filter_by(
        knowledge_test_id=knowledge_test_id
    ).delete()
    db.query(models.KnowledgeTest).filter_by(id=knowledge_test_id).delete()
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": knowledge_test_id,
            },
            "error": None,
        },
    )


@router.delete("/knowledgetests/lesson/{lesson_id}", tags=["knowledgetests"])
def delete_knowledgetest_by_lesson_id(
    lesson_id: int = Path(title="id of the lesson to delete knowledgetest"),
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

    knowledgetest = (
        db.query(models.KnowledgeTest).filter_by(lesson_id=lesson_id).first()
    )

    db.query(models.KnowledgeTestUserResults).filter_by(
        knowledge_test_id=knowledgetest.id
    ).delete()
    db.query(models.KnowledgeTestQuestions).filter_by(
        knowledge_test_id=knowledgetest.id
    ).delete()
    db.query(models.KnowledgeTest).filter_by(id=knowledgetest.id).delete()
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": knowledgetest.id,
            },
            "error": None,
        },
    )


@router.get("/knowledgetests/{knowledge_test_id}/user", tags=["knowledgetests"])
def get_knowledgetest_user(
    knowledge_test_id: int = Path(title="id of the knowledgetest"),
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

    knowledgetest = (
        db.query(models.KnowledgeTest).filter_by(id=knowledge_test_id).first()
    )
    if knowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )

    knowledgetest_results = (
        db.query(models.KnowledgeTestUserResults)
        .filter_by(knowledge_test_id=knowledge_test_id, user_id=user.id)
        .all()
    )

    if knowledgetest_results is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test results not found"},
        )

    test_passed = True
    for result in knowledgetest_results:
        if not result.is_correct:
            test_passed = False
            break

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "knowledge_test_id": knowledge_test_id,
                "user_id": user.id,
                "test_passed": test_passed,
            }
        },
    )
