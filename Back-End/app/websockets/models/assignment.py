# IMPORTS
import uuid


# MODELS
from app.websockets.models.whiteboard import Whiteboard

# CONSTANTS
from app.constants import AssignmentStatus
from app.constants import WhiteboardType


class Assignment:
    def __init__(self,  assignment_name: str, assignment_description: str, assignment_code: str = '\n\n\n\n\n\n\n\n\n\nprint("Hello World")'):
        self._id = str(uuid.uuid4())
        self._title = assignment_name
        self._desc = assignment_description
        self._initial_code = "# " + assignment_description + \
            "\n\n" + assignment_code + "\n\n\n\n\n\n\n\n\n\n"

    @property
    def id(self):
        return self._id

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, title: str):
        self._title = title

    @property
    def desc(self):
        return self._desc

    @desc.setter
    def desc(self, desc: str):
        self._desc = desc

    @property
    def initial_code(self):
        return self._initial_code

    @initial_code.setter
    def initial_code(self, initial_code: str):
        self._initial_code = initial_code

    def to_json(self):
        return {'id': self.id, 'title': self.title, 'description': self.desc, 'initialCode': self.initial_code}

    def to_user_assignment(self, user_id: str):
        return UserAssignment(user_id, self)


class UserAssignment:
    def __init__(self, user_id: str, assignment: Assignment):
        self._user_id = user_id
        self._assignment = assignment
        self._whiteboard = Whiteboard(
            assignment.initial_code, WhiteboardType.ASSIGNMENT)
        self._grade = None
        self._feedback = None
        self._grade_history = []
        self._status: AssignmentStatus = AssignmentStatus.NOT_STARTED

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, user_id: str):
        self._user_id = user_id

    @property
    def assignment(self):
        return self._assignment

    @assignment.setter
    def assignment(self, assignment: Assignment):
        self._assignment = assignment

    @property
    def whiteboard(self):
        return self._whiteboard

    @whiteboard.setter
    def whiteboard(self, whiteboard: Whiteboard):
        self._whiteboard = whiteboard

    @property
    def grade(self):
        return self._grade

    @grade.setter
    def grade(self, grade: int):
        self._grade = grade

    @property
    def feedback(self):
        return self._feedback

    @feedback.setter
    def feedback(self, feedback: str):
        self._feedback = feedback

    @property
    def grade_history(self):
        return self._grade_history

    @grade_history.setter
    def grade_history(self, grade_history: list):
        self._grade_history = grade_history

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, status: AssignmentStatus):
        self._status = status

    def to_json(self):
        return {'userId': self.user_id, 'grade': self.grade, 'assignment': self.assignment.to_json(), 'whiteboard': self.whiteboard.to_json(), 'feedback': self.feedback, 'gradeHistory': self.grade_history, 'status': self.status.value}
