from typing import Union
from fastapi import APIRouter, Depends, Path, Query, status
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models
from app.schemas.answer import (
    AnswerCheckRequest,
    AnswerCreateRequest,
    AnswerDeleteRequest,
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
    lesson = db.query(models.Lessons).filter_by(id=request_data.data.id_lesson).first()
    if lesson is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lesson not found"},
        )

    new_answer = models.Answers(
        final_answer=request_data.data.final_answer,
        id_lesson=request_data.data.id_lesson,
    )
    db.add(new_answer)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": new_answer.id,
                "final_answer": new_answer.final_answer,
                "id_lesson": new_answer.id_lesson,
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

    id_lesson = request_data.data.id_lesson
    answers = db.query(models.Answers).filter_by(id_lesson=id_lesson).all()

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

    if answer_status is False:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "status": answer_status,
                    "id_lesson": id_lesson,
                },
                "error": None,
            },
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": answer_valid.id,
                "status": answer_status,
                "id_lesson": answer_valid.id_lesson,
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
    id_answer = request_data.data.id_answer
    answer_edit = models.Answers().query.filter_by(id=id_answer).first()

    if answer_edit is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Answer not found"},
        )

    to_commit = False

    if request_data.data.final_answer is not None:
        answer_edit.final_answer = request_data.data.final_answer
        to_commit = True

    if request_data.data.id_lesson is not None:
        answer_edit.id_lesson = request_data.data.id_lesson
        to_commit = True

    if to_commit:
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": id_answer,
                "final_answer": answer_edit.final_answer,
                "id_lesson": answer_edit.id_lesson,
            },
            "error": None,
        },
    )


@router.delete("/answers/{id_answer}", tags=["answers"])
def delete_answer(
    id_answer: int = Path(title="id of the answer to delete"),
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

    db.query(models.Answers).filter_by(id=id_answer).delete()

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {"id": id_answer},
            "error": None,
        },
    )


@router.get("/lessons/{id_lesson}/answers", tags=["answers"])
def get_answers(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
    id_lesson: int = Path(title="id of the lesson"),
):
    Authorize.jwt_required()
    username = Authorize.get_jwt_subject()
    if username is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )
    answers = db.query(models.Answers).filter_by(id_lesson=id_lesson).all()
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
                    "id_lesson": answer.id_lesson,
                }
                for answer in answers
            ],
            "error": None,
        },
    )
