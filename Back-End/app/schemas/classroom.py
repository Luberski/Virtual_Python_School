from typing import Any, Optional
from pydantic import BaseModel
from pydantic_collections import BaseCollectionModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class ClassroomCreateData(BaseModel):
    name: str
    is_public: bool


class ClassroomCreateRequest(BaseJSONRequest):
    data: ClassroomCreateData


class ClassroomCreateResponseData(BaseModel):
    id: int
    name: str
    is_public: bool


class ClassroomCreateResponse(BaseJSONResponse):
    data: ClassroomCreateResponseData


class ClassroomsAllResponseData(BaseModel):
    id: int
    name: str
    teacher_id: int
    is_public: bool


class ClassroomsAllResponseDataCollection(BaseCollectionModel[ClassroomsAllResponseData]):
    class Config:
        validate_assignment_strict = False


class ClassroomsAllResponse(BaseJSONResponse):
    data: list[ClassroomsAllResponseData]


class ClassroomJoinResponseData(BaseModel):
    id: int
    user_id: int
    classroom_id: int
    is_teacher: bool


class ClassroomJoinResponse(BaseJSONResponse):
    data: ClassroomJoinResponseData


class ClassroomJoinData(BaseModel):
    classroom_id: int


class ClassroomJoinRequest(BaseJSONRequest):
    data: ClassroomJoinData
