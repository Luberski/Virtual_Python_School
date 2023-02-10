from datetime import datetime
from typing import Union
from fastapi import APIRouter, Depends, status, Query, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.routers import deps
from app import models
from app.schemas.classroom_session import (
    ClassroomSessionsAllResponse,
    ClassroomSessionsAllResponseDataCollection,
    ClassroomSessionDeleteResponse,
    ClassroomSessionDeleteResponseData,
)
from app.settings import ADMIN_ID

router = APIRouter()


@router.get("/sessions", tags=["sessions"], response_model=ClassroomSessionsAllResponse)
def get_classrooms_all(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
):
    response_data: ClassroomSessionsAllResponseDataCollection = (
        ClassroomSessionsAllResponseDataCollection()
    )

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

    user_session = (
        db.query(models.ClassroomSessions)
        .filter(models.ClassroomSessions.user_id == user.id)
        .all()
    )

    if user_session is None:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": None, "error": None},
        )
    else:
        for session in user_session:
            response_data.append(
                {
                    "id": session.id,
                    "classroom_id": session.classroom_id,
                    "user_id": session.user_id,
                    "is_teacher": session.is_teacher,
                }
            )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": response_data.dict(), "error": None},
        )


@router.delete("/sessions", tags=["sessions"], response_model=ClassroomSessionDeleteResponse)
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

    user_session = (
        db.query(models.ClassroomSessions)
        .filter(models.ClassroomSessions.user_id == user.id).first()
    )

    if user_session is None:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": None, "error": "Session not found"},
        )
    else:
        db.delete(user_session)
        db.commit()
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": {"id": user_session.user_id}, "error": None},
        )
