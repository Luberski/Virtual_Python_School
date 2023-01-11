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
