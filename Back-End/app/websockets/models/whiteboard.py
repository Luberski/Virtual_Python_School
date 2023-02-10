# CONSTANTS
from app.constants import WhiteboardType


class Whiteboard:
    def __init__(self, code: str, whiteboard_type: WhiteboardType):
        self._code = code
        self._type: WhiteboardType = whiteboard_type

    @property
    def code(self):
        return self._code

    @code.setter
    def code(self, code: str):
        self._code = code

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, whiteboard_type: WhiteboardType):
        self._type = whiteboard_type

    def to_json(self):
        return {'code': self.code, 'whiteboardType': self.type.value}
