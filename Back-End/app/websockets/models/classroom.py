# IMPORTS
from fastapi import WebSocket

# CONSTANTS
from app.constants import ClassroomUserRole
from app.constants import UserStatus
from app.constants import WhiteboardType

# MODELS
from app.websockets.models.user import User
from app.websockets.models.assignment import Assignment
from app.websockets.models.whiteboard import Whiteboard


class Classroom:
    def __init__(self, classroom_id: str):
        self._classroom_id = classroom_id
        self._users: list[User] = []
        self._shared_whiteboard: Whiteboard = Whiteboard(
            'Print("Hello World")', WhiteboardType.PUBLIC)
        self._assignments: list[Assignment] = []
        self._editable = False

    @property
    def classroom_id(self):
        return self._classroom_id

    @classroom_id.setter
    def classroom_id(self, classroom_id: str):
        self._classroom_id = classroom_id

    @property
    def users(self):
        return self._users

    @users.setter
    def users(self, users: list[User]):
        self._users = users

    @property
    def shared_whiteboard(self):
        return self._shared_whiteboard

    @shared_whiteboard.setter
    def shared_whiteboard(self, shared_whiteboard: Whiteboard):
        self._shared_whiteboard = shared_whiteboard

    @property
    def assignments(self):
        return self._assignments

    @assignments.setter
    def assignments(self, assignments: list[Assignment]):
        self._assignments = assignments

    @property
    def editable(self):
        return self._editable

    @editable.setter
    def editable(self, editable: bool):
        self._editable = editable

    def get_user(self, websocket: WebSocket):
        for user in self._users:
            if user.websocket == websocket:
                return user
        return None

    def get_user_by_id(self, user_id: str):
        for user in self._users:
            if user.user_id == user_id:
                return user
        return None

    def add_user(self, user: User):
        self._users.append(user)

    def get_all_students(self):
        students = []
        for user in self._users:
            if user.role == ClassroomUserRole.STUDENT:
                students.append(user)
        return students

    def get_teacher(self):
        for user in self._users:
            if user.role == ClassroomUserRole.TEACHER:
                return user
        return None

    def get_online_students(self):
        students = []
        for user in self._users:
            if user.role == ClassroomUserRole.STUDENT and user.status == UserStatus.ONLINE:
                students.append(user)
        return students

    def get_assignment(self, assignment_name: str):
        for assignment in self._assignments:
            if assignment.title == assignment_name:
                return assignment
        return None

    def add_assignment(self, assignment: Assignment):
        self._assignments.append(assignment)
        return assignment

    def connect_user(self, websocket: WebSocket):
        for user in self._users:
            if user.websocket == websocket:
                user.go_online()

    def disconnect_user(self, websocket: WebSocket):
        for user in self._users:
            if user.websocket == websocket:
                user.go_offline()

    def disconnect_user_by_id(self, user_id: str):
        for user in self._users:
            if user.user_id == user_id:
                user.go_offline()

    def to_json(self):
        return {
            'classroomId': self.classroom_id,
            'users': [user.to_json() for user in self.users],
            'sharedWhiteboard': self.shared_whiteboard.to_json(),
            'assignments': [assignment.to_json() for assignment in self.assignments],
            'editable': self.editable
        }
