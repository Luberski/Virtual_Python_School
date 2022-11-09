from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models, crud

router = APIRouter()


@router.get("/dashboard", tags=["dashboard"])
def get_dashboard_me(
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
        total_completed_lessons_count = crud.courses.get_total_completed_lessons_count(
            db, user
        )
        total_enrolled_lessons_count = crud.courses.get_total_enrolled_lessons_count(
            db, user
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "total_completed_lessons_count": total_completed_lessons_count,
                    "total_enrolled_lessions_count": total_enrolled_lessons_count,
                }
            },
        )
    except ValueError as err:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": str(err)},
        )
