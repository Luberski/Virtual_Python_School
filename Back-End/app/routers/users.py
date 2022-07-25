from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from sqlalchemy.orm import Session
from app.routers import deps
from app import models
from app.schemas.user import RoleCreate, UserByUsername

router = APIRouter()


@router.get("/users/me", tags=["users"])
def get_user_me(
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
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": user.username,
                "zutID": user.zut_id,
                "name": user.name,
                "lastName": user.last_name,
                "email": user.email,
                "roleId": user.role_id,
            },
            "error": None,
        },
    )


@router.post("/users", tags=["users"])
def get_user_by_username(
    request_data: UserByUsername,
    db: Session = Depends(deps.get_db),
):
    user = db.query(models.User).filter_by(username=request_data.username).first()
    if user is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "User not found"},
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "username": user.username,
                "email": user.email,
            },
            "error": None,
        },
    )


@router.post("/role", tags=["role"])
def create_role(
    request_data: RoleCreate,
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
    # TODO: Change this later
    admin_id = 1
    if db.query(models.User).filter_by(username=username).first().role_id != admin_id:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"error": "Forbidden"},
        )
    if (
        db.query(models.Roles).filter_by(role_name=request_data.role_name).first()
    ) is not None:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "Role already exists"},
        )
    new_role = models.Roles(
        role_name=request_data.role_name,
    )
    db.add(new_role)
    db.commit()

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "data": {"id": new_role.id, "role_name": new_role.role_name},
            "error": None,
        },
    )
