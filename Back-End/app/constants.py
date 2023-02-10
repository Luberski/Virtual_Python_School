from enum import Enum


class Actions(Enum):
    NONE = 0
    JOIN = 1
    CODE_CHANGE = 2
    SYNC_DATA = 3
    LEAVE = 4
    GET_DATA = 5
    LOCK_CODE = 6
    UNLOCK_CODE = 7
    TEACHER_JOIN = 8
    CLASSROOM_DELETED = 9
    ASSIGNMENT_CREATE = 10


class ClassroomUserRole(Enum):
    STUDENT = 0
    TEACHER = 1


class AssignmentStatus(Enum):
    NOT_STARTED = 0
    IN_PROGRESS = 1
    COMPLETED = 2


class UserStatus(Enum):
    OFFLINE = 0
    ONLINE = 1


class WhiteboardType(Enum):
    PUBLIC = 0
    PRIVATE = 1
    ASSIGNMENT = 2
