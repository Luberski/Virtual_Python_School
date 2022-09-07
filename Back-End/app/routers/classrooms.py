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
)
from app.settings import ADMIN_ID

router = APIRouter()


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

    user = db.query(models.User).filter_by(username=username).first()
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

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"data": classrooms_response_data.dict(), "error": None},
    )