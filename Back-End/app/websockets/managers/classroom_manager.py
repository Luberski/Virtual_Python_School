# IMPORTS
from typing import Dict

# MODELS
from app.websockets.models.classroom import Classroom


class ClassroomManager:
    def __init__(self):
        self.existing_classes: Dict[int, Classroom] = dict()

    def get_classroom(self, classroom_id: int):
        if classroom_id in self.existing_classes:
            return self.existing_classes[classroom_id]
        else:
            return None

    def add_classroom(self, classroom_id: int):
        if classroom_id not in self.existing_classes:
            self.existing_classes[classroom_id] = Classroom(
                classroom_id=classroom_id)

    def remove_classroom(self, classroom_id: int):
        self.existing_classes.pop(classroom_id)


class_manager = ClassroomManager()
