from app.websockets.models.user import User
from app.constants import ClassroomUserRole
from fastapi import WebSocket
from app.websockets.models.classroom import Classroom


class UserManager:
    def create_student(self, user_id, classroom: Classroom, websocket: WebSocket):
        new_student = User(user_id=user_id,
                           role=ClassroomUserRole.STUDENT, websocket=websocket)
        for assignment in classroom.assignments:
            new_student.add_user_assignment(
                assignment.to_user_assignment(user_id=user_id))
        return new_student

    def create_teacher(self, user_id, websocket: WebSocket):
        new_teacher = User(user_id=user_id,
                           role=ClassroomUserRole.TEACHER, websocket=websocket)
        return new_teacher


user_manager = UserManager()
