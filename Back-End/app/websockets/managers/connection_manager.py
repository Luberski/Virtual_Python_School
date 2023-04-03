# IMPORTS
import json
from typing import List, Dict
from fastapi import WebSocket

# MODELS
from app.websockets.models.classroom import Classroom

# CONSTANTS
from app.constants import Actions

# MANAGERS
from app.websockets.managers.classroom_manager import class_manager


class ConnectionManager:
    def __init__(self):
        self.existing_classes: Dict[int, Classroom] = dict()

    async def connect(self, classroom_id: int, websocket: WebSocket):
        await websocket.accept()
        class_manager.add_classroom(classroom_id)

    async def disconnect(self, classroom_id: int, websocket: WebSocket):
        user = class_manager.get_classroom(classroom_id=classroom_id).get_user(
            websocket=websocket)
        if(user):
            user.go_offline()
            payload = json.dumps(
                {"action": Actions.LEAVE.value, "data": user.to_json()})
            await self.broadcast_class_online(
                classroom_id=classroom_id, payload=payload)

    async def send_personal_payload(self, payload: str, websocket: WebSocket):
        await websocket.send_text(payload)

    async def broadcast_class(self, payload: str, classroom_id: int):
        for user in class_manager.get_classroom(classroom_id).users:
            await user.websocket.send_text(payload)

    async def broadcast_class_except(self, payload: str, classroom_id: int,  websocket: WebSocket):
        for user in class_manager.get_classroom(classroom_id).users:
            if user.websocket != websocket:
                await user.websocket.send_text(payload)

    async def broadcast_class_online(self, payload: str, classroom_id: int, ):
        for user in class_manager.get_classroom(classroom_id).users:
            if user.status.value:
                await user.websocket.send_text(payload)

    async def broadcast_class_students(self, payload: str, classroom_id: int, ):
        for user in class_manager.get_classroom(classroom_id).get_all_students():
            await user.websocket.send_text(payload)


conn_manager = ConnectionManager()
