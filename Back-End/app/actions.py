from enum import Enum


class Actions(Enum):
    NONE = 0
    JOIN = 1
    JOINED = 2
    DISCONNECTED = 3
    CODE_CHANGE = 4
    SYNC_CODE = 5
    LEAVE = 6
    GET_CODE = 7
    GET_CODE_RESPONSE = 8
    CODE_SUBMITTED = 9
    LOCK_CODE = 10
    UNLOCK_CODE = 11
    TEACHER_JOIN = 12
    CLASSROOM_DELETED = 13
