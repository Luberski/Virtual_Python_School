from pydantic import BaseModel

from app.schemas.base import BaseJSONRequest


class CourseTagCreateData(BaseModel):
    course_id: int
    name: str


class CourseTagCreateRequest(BaseJSONRequest):
    data: CourseTagCreateData
