from datetime import datetime
from fastapi import APIRouter, Depends, status, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models
from app.schemas.lesson import (
    LessonCreateRequest,
    LessonEditRequest,
    LessonJoinResponse,
    LessonJoinRequest,
)
from app.settings import ADMIN_ID

router = APIRouter()


@router.post("/lessons", tags=["lessons"])
def create_lesson(
    request_data: LessonCreateRequest,
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
    course = db.query(models.Courses).filter_by(id=request_data.data.id_course).first()
    if course is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Course not found"},
        )
    new_lesson = models.Lessons(
        name=request_data.data.name,
        description=request_data.data.description,
        id_course=request_data.data.id_course,
        type=request_data.data.type,
        number_of_answers=request_data.data.number_of_answers,
    )

    db.add(new_lesson)
    db.commit()
    new_answer = models.Answers(
        final_answer=request_data.data.final_answer,
        id_lesson=new_lesson.id,
    )

    db.add(new_answer)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "name": new_lesson.name,
                "description": new_lesson.description,
                "id_course": new_lesson.id_course,
                "type": new_lesson.type,
                "number_of_answers": new_lesson.number_of_answers,
                "answers": [
                    {
                        "id": new_answer.id,
                        "final_answer": new_answer.final_answer,
                    }
                ],
            },
            "error": None,
        },
    )


@router.patch("/lessons", tags=["lessons"])
def edit_lesson(
    request_data: LessonEditRequest,
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

    lesson_id = request_data.data.lesson_id
    lesson_edit = db.query(models.Lessons).filter_by(id=lesson_id).first()
    if lesson_edit is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lesson not found"},
        )

    to_commit = False

    if request_data.data.name:
        lesson_edit.name = request_data.data.name
        to_commit = True

    if request_data.data.description:
        lesson_edit.description = request_data.data.description
        to_commit = True

    if request_data.data.id_course:
        lesson_edit.id_course = request_data.data.id_course
        to_commit = True

    if request_data.data.type:
        lesson_edit.type = request_data.data.type
        to_commit = True

    if request_data.data.number_of_answers:
        lesson_edit.number_of_answers = request_data.data.number_of_answers
        to_commit = True

    # TODO: support for multiple answers
    if request_data.data.final_answer:
        answer_edit = db.query(models.Answers).filter_by(id_lesson=lesson_id).first()
        answer_edit.final_answer = request_data.data.final_answer
        to_commit = True

    if to_commit:
        db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": lesson_edit.id,
                "name": lesson_edit.name,
                "description": lesson_edit.description,
                "id_course": lesson_edit.id_course,
                "type": lesson_edit.type,
                "number_of_answers": lesson_edit.number_of_answers,
            },
            "error": None,
        },
    )


@router.delete("/lessons/{id_lesson}", tags=["lessons"])
def delete_lesson(
    id_lesson: int = Path(title="id of the lesson to delete"),
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

    db.query(models.Answers).filter_by(id_lesson=id_lesson).delete()
    db.query(models.Lessons).filter_by(id=id_lesson).delete()

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {"id": id_lesson},
            "error": None,
        },
    )


@router.get("/courses/{id_course}/lessons", tags=["lessons"])
def get_lessons(
    id_course: int = Path(title="id of the course"),
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
    lessons = db.query(models.Lessons).filter_by(id_course=id_course).all()
    if lessons is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lessons not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": [
                {
                    "id": lesson.id,
                    "name": lesson.name,
                    "description": lesson.description,
                    "id_course": lesson.id_course,
                    "type": lesson.type,
                    "number_of_answers": lesson.number_of_answers,
                }
                for lesson in lessons
            ],
            "error": None,
        },
    )


@router.get("/courses/{id_course}/lessons/{lesson_id}", tags=["lessons"])
def get_lesson(
    id_course: int = Path(title="id of the course"),
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
    lesson = (
        db.query(models.Lessons).filter_by(id_course=id_course, id=lesson_id).first()
    )
    if lesson is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lesson not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": lesson.id,
                "name": lesson.name,
                "description": lesson.description,
                "id_course": lesson.id_course,
                "type": lesson.type,
                "number_of_answers": lesson.number_of_answers,
            },
            "error": None,
        },
    )


@router.get("/courses/lessons/{lesson_id}/{joined_lesson_id}", tags=["lessons"])
def get_joined_lesson(
    lesson_id: int = Path(title="id of the lesson"),
    joined_lesson_id: int = Path(title="id of the joined lesson"),
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
    lesson_taken = (
        db.query(models.LessonsTaken)
        .filter_by(id=joined_lesson_id, id_lesson=lesson_id)
        .first()
    )
    if lesson_taken is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lesson not found"},
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": lesson_taken.id,
                "id_lesson": lesson_taken.id_lesson,
                "name": lesson_taken.lesson.name,
                "description": lesson_taken.lesson.description,
                "id_course": lesson_taken.lesson.id_course,
                "type": lesson_taken.lesson.type,
                "number_of_answers": lesson_taken.lesson.number_of_answers,
            },
            "error": None,
        },
    )


@router.post("/lesson", tags=["lessons"], response_model=LessonJoinResponse)
def join_lesson_me(
    request_data: LessonJoinRequest,
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

    lesson_wanted = request_data.data.id_lesson
    if lesson_wanted is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lesson does not exist"},
        )
    lesson_query = db.query(models.Lessons).filter_by(id=lesson_wanted).first()
    if lesson_query is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Lesson not found"},
        )

    lesson_taken = models.LessonsTaken(
        id_lesson=lesson_query.id,
        id_user=user.id,
        start_date=datetime.now(),
        end_date=None,
        completed=False,
    )
    db.add(lesson_taken)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": lesson_taken.id,
                "id_lesson": lesson_taken.id_lesson,
                "id_user": lesson_taken.id_user,
                "start_date": str(lesson_taken.start_date),
                "end_date": str(lesson_taken.end_date),
                "completed": lesson_taken.completed,
            },
            "error": None,
        },
    )
