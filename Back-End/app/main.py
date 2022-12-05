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
from app.db.session import Base, engine
from app import settings
from pydantic import BaseSettings
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi_jwt_auth import AuthJWT
from fastapi.responses import JSONResponse
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import datetime as dt
from dotenv import load_dotenv
from typing import List, Dict
import json
import random
from app import actions


load_dotenv()


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
    return application


app = get_application()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = dict()
        self.existing_classes: List[int] = []
        self.code: str = ""

    async def connect(self, class_id: int, websocket: WebSocket):
        await websocket.accept()
        if class_id not in self.existing_classes:
            self.existing_classes.append(class_id)
            self.active_connections[class_id] = [websocket]
        else:
            self.active_connections[class_id].append(websocket)

    def disconnect(self, class_id: int, websocket: WebSocket):
        self.active_connections[class_id].remove(websocket)
        if len(self.active_connections[class_id]) == 0:
            self.active_connections.pop(class_id)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for v_class in self.active_connections:
            for connection in self.active_connections[v_class]:
                await connection.send_text(message)

    async def broadcast_class(self, class_id: int, message: str):
        for connection in self.active_connections[class_id]:
            await connection.send_text(message)

    async def broadcast_class_except(self, class_id: int, message: str, websocket: WebSocket):
        for connection in self.active_connections[class_id]:
            if connection != websocket:
                await connection.send_text(message)


manager = ConnectionManager()


async def message_handler(message: dict, class_id: int, websocket: WebSocket):
    if message['action'] == actions.Actions.JOIN.value:
        message = await message_creator(action=actions.Actions.JOINED.value, value="{} has joined the class".format(message["user_id"]))
        await manager.broadcast_class_except(class_id=class_id, message=message, websocket=websocket)

        if manager.code and len(manager.active_connections[class_id]) > 1:
            message = await message_creator(action=actions.Actions.CODE_CHANGE.value, value=manager.code)
            await manager.send_personal_message(message=message, websocket=websocket)

    elif message['action'] == actions.Actions.SYNC_CODE.value:
        message = await message_creator(action=actions.Actions.CODE_CHANGE.value, value=manager.code)
        await manager.send_personal_message(message, websocket)

    elif message['action'] == actions.Actions.CODE_CHANGE.value:
        manager.code = message['value']
        message = await message_creator(action=actions.Actions.CODE_CHANGE.value, value=manager.code)
        await manager.broadcast_class_except(class_id=class_id, message=message, websocket=websocket)

    elif message['action'] == actions.Actions.LEAVE.value:
        message = await message_creator(action=actions.Actions.LEAVE.value, value="{} has left the class".format(message["user_id"]))
        await manager.broadcast_class_except(class_id=class_id, message=message, websocket=websocket)


async def message_creator(action: int, value: str):
    return json.dumps({"action": action, "value": value})


@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(_, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


@app.websocket("/ws/{class_id}")
async def websocket_endpoint(websocket: WebSocket, class_id: int):
    await manager.connect(websocket=websocket, class_id=class_id)
    now = dt.datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            resp = await websocket.receive_text()
            await message_handler(message=json.loads(resp), class_id=class_id, websocket=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket=websocket, class_id=class_id)
