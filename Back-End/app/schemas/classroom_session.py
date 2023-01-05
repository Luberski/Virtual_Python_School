from typing import Any, Optional
from pydantic import BaseModel
from pydantic_collections import BaseCollectionModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse

class ClassroomSessionsAllResponseData(BaseModel):
    id: int
    classroom_id: int
    user_id: int
    is_teacher: bool


class ClassroomSessionsAllResponseDataCollection(BaseCollectionModel[ClassroomSessionsAllResponseData]):
    class Config:
        validate_assignment_strict = False


class ClassroomSessionsAllResponse(BaseJSONResponse):
    data: list[ClassroomSessionsAllResponseData]