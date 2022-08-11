from typing import Optional
from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class LessonCreateData(BaseModel):
    id_course: int
    name: str
    description: str
    type: str
    number_of_answers: int
    final_answer: str


class LessonCreateRequest(BaseJSONRequest):
    data: LessonCreateData


class LessonEditData(BaseModel):
    lesson_id: int
    id_course: Optional[int]
    name: Optional[str]
    description: Optional[str]
    type: Optional[str]
    number_of_answers: Optional[int]
    final_answer: Optional[str]


class LessonEditRequest(BaseJSONRequest):
    data: LessonEditData


class LessonJoinResponseData(BaseModel):
    id: int
    id_user: int
    start_date: str
    end_date: str
    completed: Optional[bool] = False


class LessonJoinResponse(BaseJSONResponse):
    data: LessonJoinResponseData


class LessonJoinData(BaseModel):
    id_lesson: int


class LessonJoinRequest(BaseJSONRequest):
    data: LessonJoinData
