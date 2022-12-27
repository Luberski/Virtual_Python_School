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
        # TODO: Multiple teachers
        self.active_connections: Dict[int, List[WebSocket]] = dict()
        self.existing_classes: List[int] = []
        self.users: Dict[str, WebSocket] = dict()
        self.teacher: WebSocket = None
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

    async def send_personal_payload(self, payload: str, websocket: WebSocket):
        await websocket.send_text(payload)

    async def broadcast(self, payload: str):
        for v_class in self.active_connections:
            for connection in self.active_connections[v_class]:
                await connection.send_text(payload)

    async def broadcast_class(self, class_id: int, payload: str):
        for connection in self.active_connections[class_id]:
            await connection.send_text(payload)

    async def broadcast_class_except(self, class_id: int, payload: str, websocket: WebSocket):
        for connection in self.active_connections[class_id]:
            if connection != websocket:
                await connection.send_text(payload)

    def set_user(self, user_id: str, websocket: WebSocket):
        self.users[user_id] = websocket

    def get_user(self, user_id: str):
        return self.users[user_id]

    def get_user_id_by_websocket(self, websocket: WebSocket):
        for user_id, user_websocket in self.users.items():
            if user_websocket == websocket:
                return user_id

    def set_code(self, code: str):
        self.code = code

    def get_code(self):
        return self.code

    def set_teacher(self, websocket: WebSocket):
        self.teacher = websocket

    def get_teacher(self):
        return self.teacher


manager = ConnectionManager()


async def payload_handler(payload: dict, class_id: int, websocket: WebSocket):
    clientPayload_action = payload['action']
    clientPayload_value = payload['value']

    if clientPayload_action == actions.Actions.JOIN.value:
        response_payload = await payload_creator(action=actions.Actions.JOINED.value, value="{}".format(clientPayload_value))
        manager.set_user(clientPayload_value, websocket)
        await manager.broadcast_class_except(class_id=class_id, payload=response_payload, websocket=websocket)

        if manager.get_code() and len(manager.active_connections[class_id]) > 1:
            response_payload = await payload_creator(action=actions.Actions.CODE_CHANGE.value, value=manager.get_code())
            await manager.send_personal_payload(payload=response_payload, websocket=websocket)

    elif clientPayload_action == actions.Actions.TEACHER_JOIN.value:
        manager.set_teacher(websocket)

    elif clientPayload_action == actions.Actions.SYNC_CODE.value:
        response_payload = await payload_creator(action=actions.Actions.CODE_CHANGE.value, value=manager.get_code())
        await manager.send_personal_payload(payload=response_payload, websocket=websocket)

    elif clientPayload_action == actions.Actions.CODE_CHANGE.value:
        manager.set_code(clientPayload_value)
        response_payload = await payload_creator(action=actions.Actions.CODE_CHANGE.value, value=manager.get_code())
        await manager.broadcast_class_except(class_id=class_id, payload=response_payload, websocket=websocket)

    elif clientPayload_action == actions.Actions.GET_CODE.value:
        response_payload = await payload_creator(action=actions.Actions.GET_CODE.value, value=manager.get_code())
        websocket = manager.get_user(clientPayload_value)
        await manager.send_personal_payload(payload=response_payload, websocket=websocket)

    elif clientPayload_action == actions.Actions.GET_CODE_RESPONSE.value:
        response_payload = await payload_creator(action=actions.Actions.GET_CODE_RESPONSE.value, value=clientPayload_value)
        teacher_websocket = manager.get_teacher()
        await manager.send_personal_payload(payload=response_payload, websocket=teacher_websocket)

    elif clientPayload_action == actions.Actions.CODE_SUBMITTED.value:
        response_payload = await payload_creator(action=actions.Actions.CODE_SUBMITTED.value, value=clientPayload_value)
        teacher_websocket = manager.get_teacher()
        await manager.send_personal_payload(payload=response_payload, websocket=teacher_websocket)

    elif clientPayload_action == actions.Actions.LOCK_CODE.value:
        response_payload = await payload_creator(action=actions.Actions.LOCK_CODE.value, value=clientPayload_value)
        teacher_websocket = manager.get_teacher()
        await manager.broadcast_class_except(class_id=class_id, payload=response_payload, websocket=teacher_websocket)

    elif clientPayload_action == actions.Actions.UNLOCK_CODE.value:
        response_payload = await payload_creator(action=actions.Actions.UNLOCK_CODE.value, value=clientPayload_value)
        teacher_websocket = manager.get_teacher()
        await manager.broadcast_class_except(class_id=class_id, payload=response_payload, websocket=teacher_websocket)

    elif clientPayload_action == actions.Actions.CLASSROOM_DELETED.value:
        response_payload = await payload_creator(action=actions.Actions.CLASSROOM_DELETED.value, value=clientPayload_value)
        teacher_websocket = manager.get_teacher()
        await manager.broadcast_class_except(class_id=class_id, payload=response_payload, websocket=teacher_websocket)


async def payload_creator(action: int, value: str):
    return json.dumps({"action": action, "value": value})


@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(_, exc: AuthJWTException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.payload})


@app.websocket("/ws/{class_id}")
async def websocket_endpoint(websocket: WebSocket, class_id: int):
    await manager.connect(websocket=websocket, class_id=class_id)
    now = dt.datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            resp = await websocket.receive_text()
            await payload_handler(payload=json.loads(resp), class_id=class_id, websocket=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket=websocket, class_id=class_id)
        if(class_id in manager.active_connections):
            payload = await payload_creator(action=actions.Actions.LEAVE.value, value="{}".format(manager.get_user_id_by_websocket(websocket)))
            await manager.broadcast_class(class_id=class_id, payload=payload)
