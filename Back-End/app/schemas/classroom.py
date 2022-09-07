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
