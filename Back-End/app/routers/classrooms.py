import random
import string

from datetime import datetime
from typing import Union

from fastapi import APIRouter, Depends, status, Query, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.routers import deps
from app import models
from app.schemas.classroom import (
    ClassroomCreateRequest,
    ClassroomCreateResponse,
    ClassroomsAllResponse,
    ClassroomsAllResponseDataCollection,
    ClassroomJoinRequest,
    ClassroomJoinResponse,
    ClassroomCodeJoinRequest,
    ClassroomCodeJoinResponse,
    ClassroomDeleteRequest,
    ClassroomDeleteResponse,
    ClassroomDeleteResponseData,
)
from app.settings import ADMIN_ID

router = APIRouter()


def code_generator(size=8, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))


@router.post("/classrooms", tags=["classrooms"], response_model=ClassroomCreateResponse)
def create_classroom(
    request_data: ClassroomCreateRequest,
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
    check_if_classroom_exists = (
        db.query(models.Classrooms)
        .filter(models.Classrooms.name == request_data.data.name)
        .first()
    )
    if check_if_classroom_exists:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "Classroom already exists"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    check_if_user_has_classroom = (
        db.query(models.Classrooms)
        .filter(models.Classrooms.teacher_id == user.id)
        .first()
    )
    if check_if_user_has_classroom:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "Teacher cannot have more than one classroom"},
        )
    new_classroom = models.Classrooms(
        name=request_data.data.name,
        teacher_id=user.id,
        is_public=request_data.data.is_public,
        access_code=code_generator(),
    )

    db.add(new_classroom)
    db.commit()

    highest_id = db.query(func.max(models.Classrooms.id)).scalar()
    if highest_id is None:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "There is no classrooms in database"},
        )
    classroom_sessions = models.ClassroomSessions(
        user_id=user.id, classroom_id=highest_id, is_teacher=True
    )

    db.add(classroom_sessions)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": new_classroom.id,
                "name": new_classroom.name,
                "teacher_id": new_classroom.teacher_id,
                "is_public": new_classroom.is_public,
                "access_code": new_classroom.access_code,
            },
            "error": None,
        },
    )


@router.delete("/classroom/{classroom_id}", tags=["classrooms"], response_model=ClassroomDeleteResponse)
def delete_classroom(
    classroom_id: int = Path(title="Id of the classroom to delete"),
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

    # Check if classroom exists
    classroom = db.query(models.Classrooms).filter_by(
        id=classroom_id).first()
    if classroom is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Classroom not found"},
        )

    # Check if user is teacher of the classroom
    user = db.query(models.User).filter_by(username=username).first()
    if classroom.teacher_id != user.id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized"},
        )

    # Delete all sessions of the classroom
    db.query(models.ClassroomSessions).filter_by(
        classroom_id=classroom_id).delete()

    # Delete classroom
    db.query(models.Classrooms).filter_by(id=classroom_id).delete()

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": classroom_id
            },
            "error": None,
        },
    )


@router.get("/classrooms", tags=["classrooms"], response_model=ClassroomsAllResponse)
def get_classrooms_all(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
    include_private: Union[bool, None] = Query(
        False, title="Include private classrooms"),
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
    classrooms_response_data: ClassroomsAllResponseDataCollection = (
        ClassroomsAllResponseDataCollection()
    )

    classrooms = None
    if not include_private:
        classrooms = (
            db.query(models.Classrooms)
            .filter(models.Classrooms.is_public == True)
            .all()
        )
    else:
        classrooms = (
            db.query(models.Classrooms)
            .all()
        )
    if classrooms:
        for classroom in classrooms:
            classrooms_response_data.append(
                {
                    "id": classroom.id,
                    "name": classroom.name,
                    "teacher_id": classroom.teacher_id,
                    "is_public": classroom.is_public,
                    "access_code": classroom.access_code,
                }
            )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"data": classrooms_response_data.dict(), "error": None},
    )


@router.post("/classroom", tags=["classrooms"], response_model=ClassroomJoinResponse)
def join_classroom(
    request_data: ClassroomJoinRequest,
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

    target_classroom_id = request_data.data.classroom_id
    if target_classroom_id is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Classroom does not exist"},
        )
    target_classroom = db.query(models.Classrooms).filter_by(
        id=target_classroom_id).first()
    if target_classroom is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Classroom not found"},
        )

    is_assigned_to_classroom = (
        db.query(models.ClassroomSessions)
        .filter_by(user_id=user.id)
        .first()
    )
    if is_assigned_to_classroom:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "User cannot join the same classroom or multiple classrooms"},
        )

    new_record = models.ClassroomSessions(
        classroom_id=target_classroom.id,
        user_id=user.id,
        is_teacher=False,
    )
    db.add(new_record)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "user_id": new_record.user_id,
                "id": new_record.classroom_id,
                "is_teacher": new_record.is_teacher,
            },
            "error": None,
        },
    )


@router.post("/classroom/codejoin", tags=["classrooms"], response_model=ClassroomCodeJoinResponse)
def join_classroom_code(
    request_data: ClassroomCodeJoinRequest,
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

    access_code = request_data.data.access_code
    if access_code is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Classroom does not exist"},
        )

    target_classroom = db.query(models.Classrooms).filter_by(
        access_code=access_code).first()
    if target_classroom is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Access code does not match any classrooms"},
        )

    is_assigned_to_classroom = (
        db.query(models.ClassroomSessions)
        .filter_by(user_id=user.id)
        .first()
    )
    if is_assigned_to_classroom:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "User cannot join the same classroom or multiple classrooms"},
        )

    new_record = models.ClassroomSessions(
        classroom_id=target_classroom.id,
        user_id=user.id,
        is_teacher=False,
    )
    db.add(new_record)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "user_id": new_record.user_id,
                "id": new_record.classroom_id,
                "is_teacher": new_record.is_teacher,
            },
            "error": None,
        },
    )
