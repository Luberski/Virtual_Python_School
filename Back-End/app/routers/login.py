from fastapi import APIRouter, Depends, status, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi_jwt_auth import AuthJWT
from app import models
from app.ipahttp.ipahttp import ipa
from app.parsers import user_parser
from app.routers import deps
from app.schemas.user import LoginResponse


router = APIRouter()


@router.post(
    "/login",
    tags=["login"],
    response_model=LoginResponse,
)
def login(
    username: str = Form(),
    password: str = Form(),
    db: Session = Depends(deps.get_db),
    ipa_: ipa = Depends(deps.get_ipa),
    Authorize: AuthJWT = Depends(),
):
    # todo: return error if ipa is not responding
    if ipa_.login(username, password) is not None:
        ipa_user = user_parser.User(ipa_.user_show(username))
        parsed_user_data = ipa_user.parse()

        user = (
            db.query(models.User)
            .filter_by(username=parsed_user_data["data"]["zutID"])
            .first()
        )

        if user is None:

            basic_role = db.query(models.Roles).filter_by(id=1).first()
            if (basic_role) is None:
                basic_role = models.Roles(role_name="user")
                db.add(basic_role)
                db.commit()

            new_user = models.User(
                username=parsed_user_data["data"]["zutID"],
                zut_id=parsed_user_data["data"]["zutID"],
                name=parsed_user_data["data"]["name"],
                last_name=parsed_user_data["data"]["lastName"],
                email=parsed_user_data["data"]["email"],
                role_id=basic_role.id,
            )

            db.add(new_user)
            db.commit()
            access_token = Authorize.create_access_token(subject=new_user.username)
            refresh_token = Authorize.create_refresh_token(subject=new_user.username)
            return JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content={
                    "data": {
                        "username": new_user.username,
                        "zutID": new_user.zut_id,
                        "name": new_user.name,
                        "lastName": new_user.last_name,
                        "email": new_user.email,
                        "token": {
                            "access_token": access_token,
                            "refresh_token": refresh_token,
                        },
                        "role": {
                            "role_id": basic_role.id,
                            "role_name": basic_role.role_name,
                        },
                    },
                    "error": None,
                },
            )

        else:
            access_token = Authorize.create_access_token(subject=user.username)
            refresh_token = Authorize.create_refresh_token(subject=user.username)
            role = db.query(models.Roles).filter_by(id=user.role_id).first()

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "data": {
                        "username": user.username,
                        "zutID": user.zut_id,
                        "name": user.name,
                        "lastName": user.last_name,
                        "email": user.email,
                        "token": {
                            "access_token": access_token,
                            "refresh_token": refresh_token,
                        },
                        "role": {
                            "role_id": role.id,
                            "role_name": role.role_name,
                        },
                    },
                    "error": None,
                },
            )

    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN, content={"error": "Invalid credentials"}
    )
