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
)
from app.settings import ADMIN_ID

router = APIRouter()


@router.post("/classrooms", tags=["classrooms"], response_model=ClassroomCreateResponse)
def create_classroom(
    request_data: ClassroomCreateRequest,
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    print("create_classroom")
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
    print(check_if_classroom_exists)
    if check_if_classroom_exists:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "Classroom already exists"},
        )
    user = db.query(models.User).filter_by(username=username).first()
    print(user)
    check_if_user_has_classroom = (
        db.query(models.Classrooms)
        .filter(models.Classrooms.teacher_id == user.id)
        .first()
    )
    print(check_if_user_has_classroom)
    if check_if_user_has_classroom:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "Teacher cannot have more than one classroom"},
        )
    new_classroom = models.Classrooms(
        name=request_data.data.name,
        teacher_id=user.id,
        is_public=request_data.data.is_public,
    )

    db.add(new_classroom)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {
                "id": new_classroom.id,
                "name": new_classroom.name,
                "teacher_id": new_classroom.teacher_id,
                "is_public": new_classroom.is_public,
            },
            "error": None,
        },
    )


@router.delete("/classrooms/{classroom_id}", tags=["classrooms"])
def delete_classroom(
    classroom_id: int = Path(title="id of the classroom to delete"),
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
    db.query(models.Classrooms).filter_by(id=classroom_id).delete()

    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "id": classroom_id,
            },
            "error": None,
        },
    )


@router.get("/classrooms", tags=["classrooms"], response_model=ClassroomsAllResponse)
def get_classrooms_all(
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
    classrooms_response_data: ClassroomsAllResponseDataCollection = (
        ClassroomsAllResponseDataCollection()
    )

    classrooms = db.query(models.Classrooms).all()
    if classrooms:
        for classroom in classrooms:
            classrooms_response_data.append(
                {
                    "id": classroom.id,
                    "name": classroom.name,
                    "teacher_id": classroom.teacher_id,
                    "is_public": classroom.is_public,
                }
            )
    # Add support for showFull

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"data": classrooms_response_data.dict(), "error": None},
    )


@router.post("/classroom", tags=["classrooms"], response_model=ClassroomJoinResponse)
def join_classroom_me(
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

    classroom_wanted = request_data.data.classroom_id
    if classroom_wanted is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Classroom does not exist"},
        )
    classroom_query = db.query(models.Classrooms).filter_by(
        id=classroom_wanted).first()
    if classroom_query is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Classroom not found"},
        )

    check_already_joined = (
        db.query(models.JoinedClassrooms)
        .filter_by(user_id=user.id)
        .first()
    )
    if check_already_joined:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "User cannot join the same classroom or multiple classrooms"},
        )

    joined_classroom = models.JoinedClassrooms(
        classroom_id=classroom_query.id,
        user_id=user.id,
        is_teacher=False,
    )
    db.add(joined_classroom)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": username,
                "user_id": joined_classroom.user_id,
                "id": joined_classroom.classroom_id,
                "is_teacher": joined_classroom.is_teacher,
            },
            "error": None,
        },
    )
