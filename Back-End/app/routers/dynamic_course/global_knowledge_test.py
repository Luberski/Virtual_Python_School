from fastapi import APIRouter, Depends, status, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.schemas.global_knowledge_test import (
    GlobalKnowledgeTestCreateRequest,
    GlobalKnowledgeTestQuestionsCreateRequest,
    GlobalKnowledgeTestUserResultsCreateRequest,
)
from app.routers import deps
from app import models

from app.settings import ADMIN_ID

router = APIRouter()


@router.post(
    "/globalknowledgetests",
    tags=["globalknowledgetests"],
)
def create_globalknowledgetest(
    request_data: GlobalKnowledgeTestCreateRequest,
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

    globalknowledgetest = models.GlobalKnowledgeTest(
        name=request_data.data.name,
    )
    db.add(globalknowledgetest)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": globalknowledgetest.id,
                "name": globalknowledgetest.name,
            }
        },
    )


@router.post(
    "/globalknowledgetests/questions",
    tags=["globalknowledgetests"],
)
def create_globalknowledgetest_question(
    request_data: GlobalKnowledgeTestQuestionsCreateRequest,
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
            question_ = models.GlobalKnowledgeTestQuestions(
                question=question_item.question,
                answer=question_item.answer,
                global_knowledge_test_id=request_data.data.global_knowledge_test_id,
                lesson_id=question_item.lesson_id,
            )
            questions.append(question_)
            db.add(question_)
            db.commit()
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "data": {
                    "global_knowledge_test_id": request_data.data.global_knowledge_test_id,
                    "questions": [
                        {
                            "id": question.id,
                            "question": question.question,
                            "answer": question.answer,
                            "lesson_id": question.lesson_id,
                        }
                        for question in questions
                    ],
                }
            },
        )
    globalknowledgetest_question = models.GlobalKnowledgeTestQuestions(
        question=request_data.data.question,
        answer=request_data.data.answer,
        global_knowledge_test_id=request_data.data.global_knowledge_test_id,
        lesson_id=request_data.data.lesson_id,
    )
    db.add(globalknowledgetest_question)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": globalknowledgetest_question.id,
                "global_knowledge_test_id": globalknowledgetest_question.global_knowledge_test_id,
                "lesson_id": globalknowledgetest_question.lesson_id,
                "question": globalknowledgetest_question.question,
                "answer": globalknowledgetest_question.answer,
            }
        },
    )


@router.get(
    "/globalknowledgetests/{global_knowledge_test_id}",
    tags=["globalknowledgetests"],
)
def get_globalknowledgetest_by_id(
    global_knowledge_test_id: int = Path(title="id of the globalknowledgetest"),
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
    globalknowledgetest = (
        db.query(models.GlobalKnowledgeTest)
        .filter_by(
            id=global_knowledge_test_id,
        )
        .join(
            models.GlobalKnowledgeTestQuestions,
            models.GlobalKnowledgeTestQuestions.global_knowledge_test_id
            == models.GlobalKnowledgeTest.id,
        )
        .first()
    )
    if globalknowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": globalknowledgetest.id,
                "name": globalknowledgetest.name,
                "questions": [
                    {
                        "question_id": globalknowledgetest_question.id,
                        "question": globalknowledgetest_question.question,
                        "answer": globalknowledgetest_question.answer,
                        "lesson_id": globalknowledgetest_question.lesson_id,
                    }
                    for globalknowledgetest_question in globalknowledgetest.questions
                ],
            }
        },
    )


@router.get(
    "/globalknowledgetests",
    tags=["globalknowledgetests"],
)
def get_globalknowledgetests(
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

    globalknowledgetests = (
        db.query(models.GlobalKnowledgeTest)
        .join(
            models.GlobalKnowledgeTestQuestions,
            models.GlobalKnowledgeTestQuestions.global_knowledge_test_id
            == models.GlobalKnowledgeTest.id,
        )
        .all()
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "id": globalknowledgetest.id,
                    "name": globalknowledgetest.name,
                    "questions": [
                        {
                            "question_id": globalknowledgetest_question.id,
                            "question": globalknowledgetest_question.question,
                            "lesson_id": globalknowledgetest_question.lesson_id,
                            "answer": globalknowledgetest_question.answer,
                        }
                        for globalknowledgetest_question in globalknowledgetest.questions
                    ],
                }
                for globalknowledgetest in globalknowledgetests
            ]
        },
    )


@router.get(
    "/globalknowledgetest/featured",
    tags=["globalknowledgetests"],
)
def get_last_globalknowledgetest(
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

    globalknowledgetest = (
        db.query(models.GlobalKnowledgeTest)
        .order_by(models.GlobalKnowledgeTest.id.desc())
        .first()
    )
    if globalknowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": globalknowledgetest.id,
                "name": globalknowledgetest.name,
                "featured": True,
                "questions": [
                    {
                        "question_id": globalknowledgetest_question.id,
                        "question": globalknowledgetest_question.question,
                        "lesson_id": globalknowledgetest_question.lesson_id,
                        "answer": globalknowledgetest_question.answer,
                    }
                    for globalknowledgetest_question in globalknowledgetest.questions
                ],
            }
        },
    )


@router.post(
    "/globalknowledgetests/user/answers",
    tags=["globalknowledgetests"],
)
def create_globalknowledgetest_user_results(
    request_data: GlobalKnowledgeTestUserResultsCreateRequest,
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
    globalknowledgetest = (
        db.query(models.GlobalKnowledgeTest)
        .filter_by(id=request_data.data.global_knowledge_test_id)
        .first()
    )
    if globalknowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )
    for globalknowledgetest_results in request_data.data.results:
        question = (
            db.query(models.GlobalKnowledgeTestQuestions)
            .filter_by(
                id=globalknowledgetest_results.question_id,
                global_knowledge_test_id=request_data.data.global_knowledge_test_id,
            )
            .first()
        )
        if question is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": "Question for question_id not found"},
            )

        globalknowledgetest_user_results = (
            db.query(models.GlobalKnowledgeTestUserResults)
            .filter_by(
                user_id=user.id,
                global_knowledge_test_id=request_data.data.global_knowledge_test_id,
                question_id=globalknowledgetest_results.question_id,
            )
            .first()
        )
        if globalknowledgetest_user_results is not None:
            db.delete(globalknowledgetest_user_results)
            db.commit()

        globalknowledgetest_result = models.GlobalKnowledgeTestUserResults(
            user_id=user.id,
            global_knowledge_test_id=globalknowledgetest.id,
            question_id=globalknowledgetest_results.question_id,
            answer=globalknowledgetest_results.answer,
            is_correct=globalknowledgetest_results.answer == question.answer,
        )
        db.add(globalknowledgetest_result)
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": [
                {
                    "question_id": globalknowledgetest_results.question_id,
                    "answer": globalknowledgetest_results.answer,
                }
                for globalknowledgetest_results in request_data.data.results
            ]
        },
    )


@router.get(
    "/globalknowledgetests/{global_knowledge_test_id}/user/results",
    tags=["globalknowledgetests"],
)
def get_globalknowledgetest_user_results(
    global_knowledge_test_id: int = Path(title="id of the globalknowledgetest"),
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
    globalknowledgetest_results = (
        db.query(models.GlobalKnowledgeTestUserResults)
        .filter_by(global_knowledge_test_id=global_knowledge_test_id, user_id=user.id)
        .all()
    )

    if globalknowledgetest_results is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test results not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "global_knowledge_test_id": result.global_knowledge_test_id,
                    "user_id": result.user_id,
                    "question_id": result.question_id,
                    "answer": result.answer,
                }
                for result in globalknowledgetest_results
            ]
        },
    )


@router.delete(
    "/globalknowledgetests/{global_knowledge_test_id}", tags=["globalknowledgetests"]
)
def delete_globalknowledgetest(
    global_knowledge_test_id: int = Path(
        title="id of the globalknowledgetest to delete"
    ),
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

    db.query(models.GlobalKnowledgeTestUserResults).filter_by(
        global_knowledge_test_id=global_knowledge_test_id
    ).delete()
    db.query(models.GlobalKnowledgeTestQuestions).filter_by(
        global_knowledge_test_id=global_knowledge_test_id
    ).delete()
    db.query(models.GlobalKnowledgeTest).filter_by(id=global_knowledge_test_id).delete()
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": global_knowledge_test_id,
            },
            "error": None,
        },
    )


@router.get(
    "/globalknowledgetests/{global_knowledge_test_id}/stats",
    tags=["globalknowledgetests"],
)
def get_check_globalknowledgetest_user_results(
    global_knowledge_test_id: int = Path(title="id of the globalknowledgetest"),
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

    globalknowledgetest = (
        db.query(models.GlobalKnowledgeTest)
        .filter_by(id=global_knowledge_test_id)
        .first()
    )
    if globalknowledgetest is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test not found"},
        )

    globalknowledgetest_results = (
        db.query(models.GlobalKnowledgeTestUserResults)
        .filter_by(global_knowledge_test_id=global_knowledge_test_id, user_id=user.id)
        .all()
    )

    if globalknowledgetest_results is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Knowledge test results not found"},
        )

    test_passed = True
    for result in globalknowledgetest_results:
        if not result.is_correct:
            test_passed = False
            break
    total_answers = len(globalknowledgetest_results)
    total_user_correct_answers = len(
        [result for result in globalknowledgetest_results if result.is_correct is True]
    )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "global_knowledge_test_id": global_knowledge_test_id,
                "user_id": user.id,
                "test_passed": test_passed,
                "total_answers": total_answers,
                "total_correct_answers": total_user_correct_answers,
            }
        },
    )
