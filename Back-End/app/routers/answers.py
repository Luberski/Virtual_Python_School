from datetime import datetime
from fastapi import APIRouter, Depends, Path, status
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models
from app.schemas.answer import (
    AnswerCheckRequest,
    AnswerCreateRequest,
    AnswerEditRequest,
)
from app.settings import ADMIN_ID

router = APIRouter()


@router.post("/answers", tags=["answers"])
def create_answer(
    request_data: AnswerCreateRequest,
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
    lesson = db.query(models.Lessons).filter_by(id=request_data.data.lesson_id).first()
    if lesson is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lesson not found"},
        )

    new_answer = models.Answers(
        final_answer=request_data.data.final_answer,
        lesson_id=request_data.data.lesson_id,
    )
    db.add(new_answer)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": new_answer.id,
                "final_answer": new_answer.final_answer,
                "lesson_id": new_answer.lesson_id,
            },
            "error": None,
        },
    )


@router.post("/answers/check", tags=["answers"])
def check_answer(
    request_data: AnswerCheckRequest,
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

    lesson_id = request_data.data.lesson_id
    answers = db.query(models.Answers).filter_by(lesson_id=lesson_id).all()

    answer_valid = None
    answer_status = False
    length_of_answers = len(answers)
    if length_of_answers > 1:
        for answer in answers:
            if answer.final_answer == request_data.data.answer:
                answer_status = True
                answer_valid = answer
                break
    elif length_of_answers == 1:
        if answers[0].final_answer == request_data.data.answer:
            answer_status = True
            answer_valid = answers[0]
    else:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": "Answer not found",
            },
        )

    answer_history = models.AnswersHistory(
        answer_id=answers[0].id,
        lesson_id=lesson_id,
        user_id=user.id,
        answer=request_data.data.answer,
        is_correct=answer_status,
        date=datetime.now(),
    )
    db.add(answer_history)
    db.commit()

    if answer_status is True:
        if request_data.data.enrolled_lesson_id is not None:
            lesson_enrolled = (
                db.query(models.EnrolledLessons)
                .filter_by(
                    id=request_data.data.enrolled_lesson_id,
                    user_id=user.id,
                    lesson_id=lesson_id,
                )
                .first()
            )
            lesson_enrolled.completed = True
            db.commit()

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "data": {
                        "id": answer_valid.id,
                        "status": answer_status,
                        "lesson_id": answer_valid.lesson_id,
                        "completed": lesson_enrolled.completed,
                    },
                    "error": None,
                },
            )
        if request_data.data.dynamic_lesson_id is not None:
            dynamic_lesson = (
                db.query(models.DynamicLessons)
                .filter_by(
                    id=request_data.data.dynamic_lesson_id,
                    user_id=user.id,
                    lesson_id=lesson_id,
                )
                .first()
            )
            dynamic_lesson.completed = True
            db.commit()

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "data": {
                        "id": answer_valid.id,
                        "status": answer_status,
                        "lesson_id": answer_valid.lesson_id,
                        "completed": dynamic_lesson.completed,
                    },
                    "error": None,
                },
            )
    else:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "status": answer_status,
                    "lesson_id": lesson_id,
                },
                "error": None,
            },
        )


@router.patch("/answers", tags=["answers"])
def edit_answer(
    request_data: AnswerEditRequest,
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
    answer_id = request_data.data.answer_id
    answer_edit = models.Answers().query.filter_by(id=answer_id).first()

    if answer_edit is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Answer not found"},
        )

    to_commit = False

    if request_data.data.final_answer is not None:
        answer_edit.final_answer = request_data.data.final_answer
        to_commit = True

    if request_data.data.lesson_id is not None:
        answer_edit.lesson_id = request_data.data.lesson_id
        to_commit = True

    if to_commit:
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": answer_id,
                "final_answer": answer_edit.final_answer,
                "lesson_id": answer_edit.lesson_id,
            },
            "error": None,
        },
    )


@router.delete("/answers/{answer_id}", tags=["answers"])
def delete_answer(
    answer_id: int = Path(title="id of the answer to delete"),
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

    # TODO: change this after add sections + find better option to save completed courses

    db.query(models.Answers).filter_by(id=answer_id).delete()

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {"id": answer_id},
            "error": None,
        },
    )


@router.get("/lessons/{lesson_id}/answers", tags=["answers"])
def get_answers(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
    lesson_id: int = Path(title="id of the lesson"),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    answers = db.query(models.Answers).filter_by(lesson_id=lesson_id).all()
    if answers is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Answers not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "id": answer.id,
                    "final_answer": answer.final_answer,
                    "lesson_id": answer.lesson_id,
                }
                for answer in answers
            ],
            "error": None,
        },
    )
