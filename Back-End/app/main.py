# pylint: disable=C0413,E0611
import datetime
from dotenv import load_dotenv


load_dotenv()

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException
from pydantic import BaseSettings
from app import settings
from app.db.session import Base, engine
from .routers import users
from .routers import login
from .routers import courses
from .routers import answers
from .routers import lessons
from .routers import playground
from .routers import dashboard
from .routers import course_tags
from .routers import recommender
from .routers.dynamic_course import dynamic_course
from .routers.dynamic_course import survey
from .routers.dynamic_course import knowledge_test
from .routers.dynamic_course import global_knowledge_test

token_expires = datetime.timedelta(days=30)


class JWTSettings(BaseSettings):
    authjwt_secret_key: str = settings.JWT_SECRET_KEY
    authjwt_access_token_expires = token_expires
    authjwt_refresh_token_expires = token_expires


@AuthJWT.load_config
def get_config():
    return JWTSettings()


Base.metadata.create_all(bind=engine)


def get_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME, debug=settings.DEBUG, version=settings.VERSION
    )
    application.include_router(
        login.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        users.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        courses.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        lessons.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        answers.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        playground.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        dynamic_course.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        survey.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        dashboard.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        course_tags.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        recommender.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        knowledge_test.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        global_knowledge_test.router,
        prefix=settings.API_PREFIX,
    )
    return application


app = get_application()


@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(_, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})
