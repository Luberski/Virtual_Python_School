# pylint: disable=C0413,E0611
from .routers.dynamic_course import survey
from .routers.dynamic_course import dynamic_course
from .routers import course_tags
from .routers import dashboard
from .routers import classroom_sessions
from .routers import classrooms
from .routers import playground
from .routers import lessons
from .routers import answers
from .routers import courses
from .routers import login
from .routers import users
from .routers import recommender
from .routers.dynamic_course import knowledge_test
from .routers.dynamic_course import global_knowledge_test
from app.db.session import Base, engine
from app import settings
from pydantic import BaseSettings
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi_jwt_auth import AuthJWT
from fastapi.responses import JSONResponse
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import datetime as dt
from dotenv import load_dotenv
import json
from app.websockets.managers.payload_handler import payload_handler
from app.websockets.managers.connection_manager import conn_manager
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

origins = [
    "http://virtualschool.wi.zut.edu.pl",
    "https://virtualschool.wi.zut.edu.pl",
    "http://virtualschool.wi.zut.edu.pl:3000",
    "https://virtualschool.wi.zut.edu.pl:3000",
    "http://localhost",
    "http://localhost:3000",
]

token_expires = dt.timedelta(days=30)


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
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
        classrooms.router,
        prefix=settings.API_PREFIX,
    )
    application.include_router(
        classroom_sessions.router,
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


@app.websocket("/ws/{classroom_id}")
async def websocket_endpoint(websocket: WebSocket, classroom_id: int):
    await conn_manager.connect(websocket=websocket, classroom_id=classroom_id)
    try:
        while True:
            resp = await websocket.receive_text()
            await payload_handler.process_message(payload=json.loads(resp), classroom_id=classroom_id, websocket=websocket)

    except WebSocketDisconnect:
        await conn_manager.disconnect(websocket=websocket, classroom_id=classroom_id)
