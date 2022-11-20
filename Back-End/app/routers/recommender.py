from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models, crud

router = APIRouter()


@router.get("/recommender/courses", tags=["recommender"])
def get_recommended_courses_by_course_tags(
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
        similar_courses = crud.courses.get_similar_courses(db, user)

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": [
                    {
                        "id": course.id,
                        "name": course.name,
                        "description": course.description,
                        "lang": course.lang,
                        "featured": course.featured,
                        "tags": [
                            {
                                "id": tag.id,
                                "name": tag.name,
                                "course_id": tag.course_id,
                            }
                            for tag in course.tags
                        ],
                    }
                    for course in similar_courses
                ]
            },
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )
