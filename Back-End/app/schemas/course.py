from typing import Optional
from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class CourseCreateData(BaseModel):
    name: str
    description: str
    featured: Optional[bool] = False


class CourseCreateRequest(BaseJSONRequest):
    data: CourseCreateData


class CourseCreateResponseData(BaseModel):
    id: int
    name: str
    description: str
    featured: Optional[bool] = False


class CourseCreateResponse(BaseJSONResponse):
    data: CourseCreateResponseData


class CourseEditData(BaseModel):
    id_course: int
    name: Optional[str]
    description: Optional[str]
    featured: Optional[bool] = False


class CourseEditRequest(BaseJSONRequest):
    data: CourseEditData


class CourseJoinData(BaseModel):
    id_course: int


class CourseJoinRequest(BaseJSONRequest):
    data: CourseJoinData


class CourseJoinResponseData(BaseModel):
    id: int
    id_user: int
    start_date: str
    end_date: str
    section_number: int
    completed: Optional[bool] = False


class CourseJoinResponse(BaseJSONResponse):
    data: CourseJoinResponseData


class CourseJoinByIdData(BaseModel):
    id: int
    id_course: int


class CourseJoinByIdRequest(BaseJSONRequest):
    data: CourseJoinData


class CourseCloseData(BaseModel):
    id_course: int


class CourseCloseRequest(BaseJSONRequest):
    data: CourseCloseData


class CourseCloseByIdData(BaseModel):
    id: int
    id_course: int


class CourseCloseByIdRequest(BaseJSONRequest):
    data: CourseCloseByIdData
