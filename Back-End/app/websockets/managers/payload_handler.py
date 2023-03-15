# IMPORTS
import datetime
import json
from fastapi import WebSocket

# MODELS
from app.websockets.models.user import User
from app.websockets.models.assignment import UserAssignment
from app.websockets.models.assignment import Assignment
from app.websockets.models.classroom import Classroom

# CONSTANTS
from app.constants import UserStatus
from app.constants import WhiteboardType
from app.constants import ClassroomUserRole
from app.constants import Actions
from app.constants import AssignmentStatus

# MANAGERS
from app.websockets.managers.user_manager import user_manager
from app.websockets.managers.connection_manager import conn_manager
from app.websockets.managers.classroom_manager import class_manager


class PayloadHandler:
    def __init__(self):
        self._payload_action: int = None
        self._payload_user_id: str = None
        self._payload_data: dict = None
        self._source_classroom_id: int = None
        self._selected_classroom: Classroom = None
        self._source_websocket: WebSocket = None

    @property
    def payload_action(self):
        return self._payload_action

    @payload_action.setter
    def payload_action(self, payload_action: int):
        self._payload_action = payload_action

    @property
    def payload_user_id(self):
        return self._payload_user_id

    @payload_user_id.setter
    def payload_user_id(self, payload_user_id: str):
        self._payload_user_id = payload_user_id

    @property
    def payload_data(self):
        return self._payload_data

    @payload_data.setter
    def payload_data(self, payload_data: dict):
        self._payload_data = payload_data

    @property
    def source_classroom_id(self):
        return self._source_classroom_id

    @source_classroom_id.setter
    def source_classroom_id(self, source_classroom_id: int):
        self._source_classroom_id = source_classroom_id

    @property
    def selected_classroom(self):
        return self._selected_classroom

    @selected_classroom.setter
    def selected_classroom(self, selected_classroom: Classroom):
        self._selected_classroom = selected_classroom

    @property
    def source_websocket(self):
        return self._source_websocket

    @source_websocket.setter
    def source_websocket(self, source_websocket: WebSocket):
        self._source_websocket = source_websocket

    def set_message_data(self, payload: dict, classroom_id: int, websocket: WebSocket):
        self.payload_action = payload['action']
        self.payload_user_id = payload['user_id']
        self.payload_data = payload['data']
        self.source_classroom_id = classroom_id
        self.selected_classroom = class_manager.get_classroom(
            classroom_id=classroom_id)
        self.source_websocket = websocket

    async def process_message(self, payload: dict, classroom_id: int, websocket: WebSocket):
        self.set_message_data(
            payload=payload, classroom_id=classroom_id, websocket=websocket)

        if self.payload_action == Actions.JOIN.value:
            await self.join()

        elif self.payload_action == Actions.TEACHER_JOIN.value:
            await self.teacher_join()

        elif self.payload_action == Actions.CODE_CHANGE.value:
            await self.code_change()

        elif self.payload_action == Actions.GET_DATA.value:
            await self.get_data()

        elif self.payload_action == Actions.ASSIGNMENT_CREATE.value:
            await self.assignment_create()

        elif self.payload_action == Actions.LOCK_CODE.value:
            await self.lock_code()

        elif self.payload_action == Actions.UNLOCK_CODE.value:
            await self.unlock_code()

        elif self.payload_action == Actions.CLASSROOM_DELETED.value:
            await self.classroom_deleted()

        elif self.payload_action == Actions.SUBMIT_ASSIGNMENT.value:
            await self.submit_assignment()

        elif self.payload_action == Actions.GRADE_ASSIGNMENT.value:
            await self.grade_assignment()

    async def join(self):
        # check if user is already in classroom and is reconnecting
        user = self.selected_classroom.get_user_by_id(self.payload_user_id)
        if user is not None:
            # Update websocket and status
            user.websocket = self.source_websocket
            user.status = UserStatus.ONLINE

            # Send message to user
            active_students = [
                user.to_json() for user in self.selected_classroom.get_online_students()]
            response_payload = json.dumps({
                "action": Actions.SYNC_DATA.value,
                "data": {
                    "users": active_students,
                    "teacher": self.selected_classroom.get_teacher().to_json(),
                    "personalData": user.to_json(),
                    "classroomData": self.selected_classroom.to_json()
                }
            })

            await conn_manager.send_personal_payload(payload=response_payload, websocket=self.source_websocket)

        else:
            # Create new user
            user = user_manager.create_student(
                user_id=self.payload_user_id, classroom=self.selected_classroom, websocket=self.source_websocket)

            # Add user to classroom
            self.selected_classroom.add_user(user)

            # Send message to user
            active_students = [
                user.to_json() for user in self.selected_classroom.get_online_students()]
            response_payload = json.dumps({
                "action": Actions.SYNC_DATA.value,
                "data": {
                    "users": active_students,
                    "teacher": self.selected_classroom.get_teacher().to_json(),
                    "personalData": user.to_json(),
                    "classroomData": self.selected_classroom.to_json()
                }
            })

            await conn_manager.send_personal_payload(payload=response_payload, websocket=self.source_websocket)

        # Broadcast message to all users in classroom that a new user has joined
        class_payload = json.dumps({
            "action": Actions.JOIN.value,
            "data": user.to_json()
        })

        await conn_manager.broadcast_class_except(classroom_id=self.source_classroom_id, payload=class_payload, websocket=self.source_websocket)

    async def teacher_join(self):
        response_payload = None

        # check if teacher is already in classroom and is reconnecting
        user = self.selected_classroom.get_user_by_id(self.payload_user_id)
        if user is not None:
            # Update websocket and status
            user.websocket = self._source_websocket
            user.status = UserStatus.ONLINE

            response_payload = json.dumps({
                "action": Actions.SYNC_DATA.value,
                "data": {
                    "classroomData": self.selected_classroom.to_json(),
                    "personalData": user.to_json()
                }
            })

            await conn_manager.send_personal_payload(payload=response_payload, websocket=self.source_websocket)
        else:
            # Create new teacher
            new_user = user_manager.create_teacher(
                user_id=self.payload_user_id, websocket=self.source_websocket)

            # Add teacher to classroom
            self.selected_classroom.add_user(new_user)

    async def code_change(self):
        source_user = self.selected_classroom.get_user(
            websocket=self.source_websocket)
        source_code = self.payload_data["code"]
        source_whiteboard_type = self.payload_data["whiteboard_type"]

        # Check if user is teacher
        if source_user.role == ClassroomUserRole.TEACHER:
            # Check whiteboard type
            if source_whiteboard_type == WhiteboardType.PUBLIC.value:
                # Update shared whiteboard code and broadcast to all students
                self.selected_classroom.shared_whiteboard.code = source_code

                response_payload = json.dumps({
                    "action": Actions.CODE_CHANGE.value,
                    "data": {
                        "source": source_user.to_json(),
                        "whiteboard": self.selected_classroom.shared_whiteboard.to_json()
                    }
                })

                await conn_manager.broadcast_class_students(classroom_id=self.source_classroom_id, payload=response_payload)

            elif source_whiteboard_type == WhiteboardType.PRIVATE.value:
                # Update user whiteboard code and send it to user
                target_user = self.selected_classroom.get_user_by_id(
                    self.payload_data["target_user"])
                target_user.whiteboard.code = source_code

                response_payload = json.dumps({
                    "action": Actions.CODE_CHANGE.value,
                    "data": {
                        "source": source_user.to_json(),
                        "whiteboard": target_user.whiteboard.to_json()
                    }
                })

                await conn_manager.send_personal_payload(payload=response_payload, websocket=target_user.websocket)

            elif source_whiteboard_type == WhiteboardType.ASSIGNMENT.value:
                # Update user assignment whiteboard code and send it to user
                target_user = self.selected_classroom.get_user_by_id(
                    self.payload_data["target_user"])
                assignment_name = self.payload_data["assignment_name"]
                user_assignment = target_user.get_user_assignment(
                    assignment_name=assignment_name)
                user_assignment.whiteboard.code = source_code

                response_payload = json.dumps({
                    "action": Actions.CODE_CHANGE.value,
                    "data": {
                        "source": source_user.to_json(),
                        "whiteboard": user_assignment.whiteboard.to_json(),
                        "userAssignment": user_assignment.to_json()
                    }
                })

                await conn_manager.send_personal_payload(payload=response_payload, websocket=target_user.websocket)

        else:
            if source_whiteboard_type == WhiteboardType.PRIVATE.value:
                # Update user private whiteboard code and send it to teacher
                source_user.whiteboard.code = source_code

                response_payload = json.dumps({
                    "action": Actions.CODE_CHANGE.value,
                    "data": {
                        "source": source_user.to_json(),
                        "whiteboard": source_user.whiteboard.to_json()
                    }
                })

                await conn_manager.send_personal_payload(payload=response_payload, websocket=self.selected_classroom.get_teacher().websocket)

            elif source_whiteboard_type == WhiteboardType.PUBLIC.value:
                if(self.selected_classroom.editable == False):
                    return

                # Update shared whiteboard code and send it to teacher'
                self.selected_classroom.shared_whiteboard.code = source_code
                response_payload = json.dumps({
                    "action": Actions.CODE_CHANGE.value,
                    "data": {
                        "source": source_user.to_json(),
                        "whiteboard": self.selected_classroom.shared_whiteboard.to_json()
                    }
                })

                await conn_manager.broadcast_class(payload=response_payload, classroom_id=self.source_classroom_id)

            elif source_whiteboard_type == WhiteboardType.ASSIGNMENT.value:
                # Update user assignment whiteboard code and send it to teacher
                assignment = source_user.get_user_assignment(
                    assignment_name=self.payload_data["assignment_name"])
                assignment.whiteboard.code = source_code

                response_payload = json.dumps({
                    "action": Actions.CODE_CHANGE.value,
                    "data": {
                        "source": source_user.to_json(),
                        "whiteboard": assignment.whiteboard.to_json(),
                        "userAssignment": assignment.to_json()
                    }
                })

                await conn_manager.send_personal_payload(payload=response_payload, websocket=self.selected_classroom.get_teacher().websocket)

    async def get_data(self):
        source_user = self.selected_classroom.get_user(
            websocket=self.source_websocket)
        source_whiteboard_type = self.payload_data["whiteboard_type"]

        response_payload = None

        if source_whiteboard_type == WhiteboardType.PUBLIC.value:
            response_payload = json.dumps({
                "action": Actions.GET_DATA.value,
                "data": {
                    "whiteboard": self.selected_classroom.shared_whiteboard.to_json()
                }
            })
        elif source_whiteboard_type == WhiteboardType.PRIVATE.value:
            target_user = self.selected_classroom.get_user_by_id(
                self.payload_data["target_user"])
            response_payload = json.dumps({
                "action": Actions.GET_DATA.value,
                "data": {
                    "targetUser": target_user.to_json()
                }
            })
        elif source_whiteboard_type == WhiteboardType.ASSIGNMENT.value:
            target_user = self.selected_classroom.get_user_by_id(
                self.payload_data["target_user"])
            assignment = target_user.get_user_assignment(
                assignment_name=self.payload_data["assignment_name"])
            response_payload = json.dumps({
                "action": Actions.GET_DATA.value,
                "data": {
                    "targetUser": target_user.to_json(),
                    "userAssignment": assignment.to_json()
                }
            })

        await conn_manager.send_personal_payload(payload=response_payload, websocket=source_user.websocket)

    async def assignment_create(self):
        new_assignment = Assignment(
            self.payload_data["assignment_name"], self.payload_data["assignment_description"], self.payload_data["assignment_code"])
        added_assignment = self.selected_classroom.add_assignment(
            new_assignment)

        for student in self.selected_classroom.get_all_students():
            user_assignment = added_assignment.to_user_assignment(
                student.user_id)
            student.add_user_assignment(user_assignment
                                        )
            response_students = json.dumps({
                "action": Actions.ASSIGNMENT_CREATE.value,
                "data": user_assignment.to_json()
            })
            await conn_manager.send_personal_payload(payload=response_students, websocket=student.websocket)

        response_teacher = json.dumps({
            "action": Actions.ASSIGNMENT_CREATE.value,
            "data": {
                "assignment": added_assignment.to_json(),
                "students": [student.to_json() for student in self.selected_classroom.get_all_students()]
            }
        })

        await conn_manager.send_personal_payload(payload=response_teacher, websocket=self.selected_classroom.get_teacher().websocket)

    async def lock_code(self):
        self.selected_classroom.editable = False
        response_payload = json.dumps({"action": Actions.LOCK_CODE.value})
        await conn_manager.broadcast_class_students(classroom_id=self.source_classroom_id, payload=response_payload)

    async def unlock_code(self):
        self.selected_classroom.editable = True
        response_payload = json.dumps({"action": Actions.UNLOCK_CODE.value})
        await conn_manager.broadcast_class_students(classroom_id=self.source_classroom_id, payload=response_payload)

    async def classroom_deleted(self):
        response_payload = json.dumps(
            {"action": Actions.CLASSROOM_DELETED.value})
        await conn_manager.broadcast_class_students(classroom_id=self.source_classroom_id, payload=response_payload)
        class_manager.remove_classroom(self.source_classroom_id)

    async def submit_assignment(self):
        user_assignment = self.payload_data
        source_user = self.selected_classroom.get_user(
            websocket=self.source_websocket)
        assignment = source_user.get_user_assignment(
            assignment_name=user_assignment)

        assignment.status = AssignmentStatus.SUBMITTED

        response_payload = json.dumps({
            "action": Actions.SUBMIT_ASSIGNMENT.value,
            "data": {
                "source": source_user.to_json(),
                "userAssignment": assignment.to_json()
            }
        })

        await conn_manager.send_personal_payload(payload=response_payload, websocket=self.selected_classroom.get_teacher().websocket)

    async def grade_assignment(self):
        user_assignment = self.payload_data
        assignment_status = user_assignment["status"]
        target_user = self.selected_classroom.get_user_by_id(
            user_id=user_assignment["userId"])
        updated_user_assignment = target_user.get_user_assignment(
            assignment_name=user_assignment["assignment"]["title"])

        updated_user_assignment.grade = user_assignment["grade"]
        updated_user_assignment.status = AssignmentStatus(
            assignment_status)
        updated_user_assignment.feedback = user_assignment["feedback"]

        updated_user_assignment.grade_history.append(
            {"grade": updated_user_assignment.grade, "feedback": updated_user_assignment.feedback})

        response_payload = json.dumps({
            "action": Actions.GRADE_ASSIGNMENT.value,
            "data": updated_user_assignment.to_json(),
            "timestamp": datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        })

        await conn_manager.send_personal_payload(payload=response_payload, websocket=target_user.websocket)


payload_handler = PayloadHandler()
