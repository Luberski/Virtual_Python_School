from typing import Optional
from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class LessonCreateData(BaseModel):
    course_id: int
    name: str
    description: str
    type: str
    number_of_answers: int
    final_answer: str


class LessonCreateRequest(BaseJSONRequest):
    data: LessonCreateData


class LessonEditData(BaseModel):
    lesson_id: int
    course_id: Optional[int]
    name: Optional[str]
    description: Optional[str]
    type: Optional[str]
    number_of_answers: Optional[int]
    final_answer: Optional[str]


class LessonEditRequest(BaseJSONRequest):
    data: LessonEditData


class LessonEnrollResponseData(BaseModel):
    id: int
    user_id: int
    start_date: str
    end_date: str
    completed: Optional[bool] = False


class LessonEnrollResponse(BaseJSONResponse):
    data: LessonEnrollResponseData


class LessonEnrollData(BaseModel):
    lesson_id: int
    enrolled_course_id: int


class LessonEnrollRequest(BaseJSONRequest):
    data: LessonEnrollData
