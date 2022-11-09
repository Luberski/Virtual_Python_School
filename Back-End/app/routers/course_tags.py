from fastapi import APIRouter, Depends, status, Path
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models, crud
from app.schemas.course_tag import (
    CourseTagCreateRequest,
)

router = APIRouter()


@router.post("/tags/courses", tags=["tags"])
def create_course_tag(
    request_data: CourseTagCreateRequest,
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

    try:
        new_tag = crud.courses.create_course_tag(db, request_data.data)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "id": new_tag.id,
                    "name": new_tag.name,
                    "course_id": new_tag.course_id,
                }
            },
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )


@router.get("/tags/courses", tags=["tags"])
def get_course_tags(
    db: Session = Depends(deps.get_db),
):
    try:
        tags = crud.courses.get_course_tags(db)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": [
                    {
                        "id": tag.id,
                        "name": tag.name,
                        "course_id": tag.course_id,
                    }
                    for tag in tags
                ]
            },
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )


@router.get("/tags/courses/{course_id}", tags=["tags"])
def get_course_tags_by_course_id(
    db: Session = Depends(deps.get_db),
    course_id: int = Path(title="id of the course"),
):
    try:
        tags = crud.courses.get_course_tags_by_course_id(db, course_id)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": [
                    {
                        "id": tag.id,
                        "name": tag.name,
                        "course_id": tag.course_id,
                    }
                    for tag in tags
                ]
            },
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )


@router.delete("/tags/{tag_id}", tags=["tags"])
def delete_course_tag(
    db: Session = Depends(deps.get_db),
    Authorize: AuthJWT = Depends(),
    tag_id: int = Path(title="id of the tag"),
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

    try:
        crud.courses.delete_course_tag(db, tag_id)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "id": tag_id,
                }
            },
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )
