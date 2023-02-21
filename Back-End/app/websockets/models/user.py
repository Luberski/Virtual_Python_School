# IMPORTS
from fastapi import WebSocket

# MODELS
from app.websockets.models.assignment import UserAssignment
from app.websockets.models.whiteboard import Whiteboard

# CONSTANTS
from app.constants import WhiteboardType
from app.constants import UserStatus
from app.constants import ClassroomUserRole


class User:
    def __init__(self, user_id: str, websocket: WebSocket, role: ClassroomUserRole):
        self._user_id = user_id
        self._websocket = websocket
        self._role: ClassroomUserRole = role
        self._whiteboard: Whiteboard = Whiteboard(
            'print("Hello World")', WhiteboardType.PRIVATE)
        self._user_assignments: list[UserAssignment] = []
        self._status: UserStatus = UserStatus.ONLINE

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, user_id: str):
        self._user_id = user_id

    @property
    def websocket(self):
        return self._websocket

    @websocket.setter
    def websocket(self, websocket: WebSocket):
        self._websocket = websocket

    @property
    def role(self):
        return self._role

    @role.setter
    def role(self, role: ClassroomUserRole):
        self._role = role

    @property
    def whiteboard(self):
        return self._whiteboard

    @whiteboard.setter
    def whiteboard(self, whiteboard: Whiteboard):
        self._whiteboard = whiteboard

    @property
    def user_assignments(self):
        return self._user_assignments

    @user_assignments.setter
    def user_assignments(self, user_assignments: list[UserAssignment]):
        self._user_assignments = user_assignments

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, status: UserStatus):
        self._status = status

    def get_user_assignment(self, assignment_name: str):
        for user_assignment in self._user_assignments:
            if user_assignment.assignment.title == assignment_name:
                return user_assignment
        return None

    def add_user_assignment(self, user_assignment: UserAssignment):
        self._user_assignments.append(user_assignment)
        return user_assignment

    def add_whiteboard(self, whiteboard: Whiteboard):
        self._whiteboards.append(whiteboard)

    def go_online(self):
        self._status = UserStatus.ONLINE

    def go_offline(self):
        self._status = UserStatus.OFFLINE

    def to_json(self):
        return {
            'userId': self.user_id,
            'role': self.role.value,
            'online': self.status.value,
            'whiteboard': self.whiteboard.to_json(),
            'userAssignments': [user_assignment.to_json() for user_assignment in self.user_assignments]
        }
