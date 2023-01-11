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


class Assignment:
    def __init__(self,  assignment_name: str, assignment_description: str, assignment_creator_id: str):
        self.assignment_name = assignment_name
        self.assignment_creator_id = assignment_creator_id
        self.assignment_description = assignment_description


class UserAssignment:
    def __init__(self, user_id: str, assignment: Assignment, code: str):
        self.user_id = user_id
        self.assignment = assignment
        self.whiteboard = Whiteboard(code, 'private')
        self.grade = None


class Whiteboard:
    def __init__(self, code: str, whiteboard_type: str):
        self.code = code
        self.whiteboard_type = whiteboard_type


class User:
    def __init__(self, user_id: str, websocket: WebSocket, role: str):
        self.user_id = user_id
        self.websocket = websocket
        self.role = role  # 0 = student, 1 = teacher
        self.whiteboard: Whiteboard = Whiteboard(
            'Print("Hello World")', 'private')
        self.user_assignments: list[UserAssignment] = []
        self.online = True

    def add_whiteboard(self, whiteboard: Whiteboard):
        self.whiteboards.append(whiteboard)

    def add_user_assignment(self, user_assignment: UserAssignment):
        self.user_assignments.append(user_assignment)

    def get_user_assignment(self, assignment_name: str):
        for user_assignment in self.user_assignments:
            if user_assignment.assignment.assignment_name == assignment_name:
                return user_assignment

    def get_whiteboard(self, whiteboard_type: str):
        for whiteboard in self.whiteboards:
            if whiteboard.whiteboard_type == whiteboard_type:
                return whiteboard

    def update_websocket(self, websocket: WebSocket):
        self.websocket = websocket


class Classroom:
    def __init__(self, classroom_id: str):
        self.classroom_id = classroom_id
        self.users: list[User] = []
        self.shared_whiteboard: Whiteboard = Whiteboard(
            'Print("Hello World")', 'public')
        self.editing_locked = False

    def add_user(self, user: User):
        self.users.append(user)

    def get_user_by_id(self, user_id: str):
        for user in self.users:
            if user.user_id == user_id:
                return user

    def get_user_by_websocket(self, websocket: WebSocket):
        for user in self.users:
            if user.websocket == websocket:
                return user

    def remove_user_by_id(self, user_id: str):
        for user in self.users:
            if user.user_id == user_id:
                user.online = False
                return user

    def remove_user_by_websocket(self, websocket: WebSocket):
        for user in self.users:
            if user.websocket == websocket:
                user.online = False

    def get_all_users(self):
        return self.users

    def get_all_students(self):
        students = []
        for user in self.users:
            if user.role == "student":
                students.append(user)
        return students

    def get_teacher(self):
        for user in self.users:
            if user.role == "teacher":
                return user
        return None


class ConnectionManager:
    def __init__(self):
        self.existing_classes: Dict[int, Classroom] = dict()

    async def connect(self, class_id: int, websocket: WebSocket):
        await websocket.accept()
        if class_id not in self.existing_classes:
            self.existing_classes[class_id] = Classroom(class_id)

    async def disconnect(self, class_id: int, websocket: WebSocket):
        user = self.existing_classes[class_id].get_user_by_websocket(websocket)
        self.existing_classes[class_id].remove_user_by_websocket(websocket)
        payload = json.dumps(
            {"action": actions.Actions.LEAVE.value, "data": {"user_id": user.user_id}})
        await manager.broadcast_class_online(class_id=class_id, payload=payload)

    def remove_class(self, class_id: int):
        self.existing_classes.pop(class_id)

    async def send_personal_payload(self, payload: str, websocket: WebSocket):
        await websocket.send_text(payload)

    async def broadcast_class(self, class_id: int, payload: str):
        for user in self.existing_classes[class_id].get_all_users():
            await user.websocket.send_text(payload)

    async def broadcast_class_except(self, class_id: int, payload: str, websocket: WebSocket):
        for user in self.existing_classes[class_id].get_all_users():
            if user.websocket != websocket:
                await user.websocket.send_text(payload)

    async def broadcast_class_online(self, class_id: int, payload: str):
        for user in self.existing_classes[class_id].get_all_users():
            if user.online:
                await user.websocket.send_text(payload)

    async def broadcast_class_students(self, class_id: int, payload: str):
        for user in self.existing_classes[class_id].get_all_students():
            await user.websocket.send_text(payload)

    def set_user(self, class_id: str, user_id: str, websocket: WebSocket):
        self.existing_classes[class_id].add_user(
            User(user_id=user_id, role="student", websocket=websocket))

    def get_user(self, class_id: str, user_id: str):
        return self.existing_classes[class_id].get_user_by_id(user_id)

    def get_user_by_websocket(self, class_id: str, websocket: WebSocket):
        return self.existing_classes[class_id].get_user_by_websocket(websocket)

    def set_shared_code(self, class_id: int, code: str):
        self.existing_classes[class_id].shared_whiteboard.code = code

    def get_shared_code(self, class_id: int):
        return self.existing_classes[class_id].shared_whiteboard.code

    def set_teacher(self, class_id: int, user_id: str, websocket: WebSocket):
        self.existing_classes[class_id].add_user(
            User(user_id=user_id, websocket=websocket, role="teacher"))

    def get_teacher(self, class_id: int):
        return self.existing_classes[class_id].get_teacher()

    def get_users(self, class_id: int):
        return self.existing_classes[class_id].get_all_users()

    def get_students(self, class_id: int):
        return self.existing_classes[class_id].get_all_students()


manager = ConnectionManager()


async def payload_handler(payload: dict, class_id: int, websocket: WebSocket):
    clientPayload_action = payload['action']
    clientPayload_user_id = payload['user_id']
    clientPayload_data = payload['data']

    if clientPayload_action == actions.Actions.JOIN.value:
        users = []
        for user in manager.get_students(class_id):
            if(user.online and user.user_id != clientPayload_user_id):
                users.append(user.user_id)

        if manager.get_user(class_id, clientPayload_user_id) is not None:
            # When user reconnects update its websocket and send all remaining data
            # TODO: Add support for assignments
            user = manager.get_user(class_id, clientPayload_user_id)
            user.update_websocket(websocket)
            user.online = True
            response_payload = json.dumps(
                {"action": actions.Actions.SYNC_DATA.value, "data": {"users": users, "is_editable": manager.existing_classes[class_id].editing_locked, "teacher": manager.get_teacher(class_id).user_id, "personal_whiteboard": manager.get_user_by_websocket(class_id, websocket).whiteboard.code, "shared_whiteboard": manager.get_shared_code(class_id), "assignments": None}})
            await manager.send_personal_payload(response_payload, websocket)
        else:
            # Create a new user
            response_payload = json.dumps(
                {"action": actions.Actions.SYNC_DATA.value, "data": {"users": users, "is_editable": manager.existing_classes[class_id].editing_locked, "teacher": manager.get_teacher(class_id).user_id, "personal_whiteboard": "Print(\"Hello World\")", "shared_whiteboard": manager.get_shared_code(class_id), "assignments": None}})

            manager.set_user(
                class_id=class_id, user_id=clientPayload_user_id, websocket=websocket)
            await manager.send_personal_payload(response_payload, websocket)

        class_payload = json.dumps(
            {"action": actions.Actions.JOIN.value, "data": {"user_id": clientPayload_user_id}})
        await manager.broadcast_class_except(class_id=class_id, payload=class_payload, websocket=websocket)

    elif clientPayload_action == actions.Actions.TEACHER_JOIN.value:
        # TODO: Add support for assignments
        users = []
        for user in manager.get_students(class_id):
            if(user.online):
                users.append(user.user_id)

        if manager.get_teacher(class_id) is not None:
            user = manager.get_user(class_id, clientPayload_user_id)
            user.update_websocket(websocket)
            user.online = True

            response_payload = json.dumps(
                {"action": actions.Actions.SYNC_DATA.value, "data": {"users": users, "is_editable": manager.existing_classes[class_id].editing_locked, "shared_whiteboard": manager.get_shared_code(class_id), "assignments": None}})
            await manager.send_personal_payload(response_payload, websocket)
        else:
            manager.set_teacher(class_id, clientPayload_user_id, websocket)

    elif clientPayload_action == actions.Actions.CODE_CHANGE.value:
        whiteboard_type = clientPayload_data["whiteboard_type"]
        whiteboard_code = clientPayload_data["code"]

        if manager.get_user_by_websocket(class_id, websocket).role == "teacher":
            if whiteboard_type == "public":
                manager.set_shared_code(class_id, whiteboard_code)
                response_payload = json.dumps(
                    {"action": actions.Actions.CODE_CHANGE.value, "data": {"user_id": clientPayload_user_id, "whiteboard_type": whiteboard_type, "code": whiteboard_code}})
                await manager.broadcast_class_students(class_id, response_payload)
            elif whiteboard_type == "private":
                target_user = manager.get_user(
                    class_id, clientPayload_data["target_user"])
                target_user.whiteboard.code = whiteboard_code
                response_payload = json.dumps(
                    {"action": actions.Actions.CODE_CHANGE.value, "data": {"user_id": clientPayload_user_id, "whiteboard_type": whiteboard_type, "code": whiteboard_code}})
                await manager.send_personal_payload(response_payload, target_user.websocket)
            else:
                # TODO: Add support for assignments
                pass
        else:
            if whiteboard_type == "private":
                manager.get_user_by_websocket(
                    class_id, websocket).whiteboard.code = whiteboard_code

                response_payload = json.dumps(
                    {"action": actions.Actions.CODE_CHANGE.value, "data": {"user_id": clientPayload_user_id, "whiteboard_type": whiteboard_type, "code": whiteboard_code}})
                await manager.send_personal_payload(response_payload, manager.get_teacher(class_id).websocket)
            elif whiteboard_type == "public":
                manager.set_shared_code(class_id, whiteboard_code)
                response_payload = json.dumps(
                    {"action": actions.Actions.CODE_CHANGE.value, "data": {"user_id": clientPayload_user_id, "whiteboard_type": whiteboard_type, "code": whiteboard_code}})
                await manager.broadcast_class(class_id, response_payload)
            else:
                # TODO: Add support for assignments
                assignment_id = clientPayload_data["assignment_id"]
                pass

    elif clientPayload_action == actions.Actions.GET_DATA.value:
        target_user = clientPayload_data["target_user"]
        whiteboard_type = clientPayload_data["whiteboard_type"]
        response_payload = None

        if whiteboard_type == "public":
            response_payload = json.dumps({"action": actions.Actions.GET_DATA.value, "data": {
                                          "whiteboard_type": whiteboard_type, "code": manager.get_shared_code(class_id)}})
        elif whiteboard_type == "private":
            response_payload = json.dumps({"action": actions.Actions.GET_DATA.value, "data": {
                                          "target_user": target_user, "whiteboard_type": whiteboard_type, "code": manager.get_user(class_id, target_user).whiteboard.code}})
        else:
            # TODO: Add support for assignments
            pass

        await manager.send_personal_payload(response_payload, websocket)

    elif clientPayload_action == actions.Actions.LOCK_CODE.value:
        response_payload = json.dumps(
            {"action": actions.Actions.LOCK_CODE.value})
        manager.existing_classes[class_id].editing_locked = True
        await manager.broadcast_class_students(class_id=class_id, payload=response_payload)

    elif clientPayload_action == actions.Actions.UNLOCK_CODE.value:
        response_payload = json.dumps(
            {"action": actions.Actions.UNLOCK_CODE.value})
        manager.existing_classes[class_id].editing_locked = False
        await manager.broadcast_class_students(class_id=class_id, payload=response_payload)

    elif clientPayload_action == actions.Actions.CLASSROOM_DELETED.value:
        response_payload = json.dumps(
            {"action": actions.Actions.CLASSROOM_DELETED.value})
        await manager.broadcast_class_students(class_id=class_id, payload=response_payload)
        manager.remove_class(class_id)


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
        await manager.disconnect(websocket=websocket, class_id=class_id)
