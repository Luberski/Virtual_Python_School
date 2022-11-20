from typing import Any, Optional
from pydantic import BaseModel
from pydantic_collections import BaseCollectionModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class CourseCreateData(BaseModel):
    name: str
    description: str
    featured: Optional[bool] = False
    lang: Optional[str] = None


class CourseCreateRequest(BaseJSONRequest):
    data: CourseCreateData


class CourseCreateResponseData(BaseModel):
    id: int
    name: str
    description: str
    featured: Optional[bool] = False
    lang: Optional[str] = None


class CourseCreateResponse(BaseJSONResponse):
    data: CourseCreateResponseData


class CourseEditData(BaseModel):
    course_id: int
    name: Optional[str]
    description: Optional[str]
    featured: Optional[bool] = False
    lang: Optional[str] = None
    tags: Optional[list[str]] = []


class CourseEditRequest(BaseJSONRequest):
    data: CourseEditData


class CourseJoinData(BaseModel):
    course_id: int


class CourseJoinRequest(BaseJSONRequest):
    data: CourseJoinData


class CourseJoinResponseData(BaseModel):
    id: int
    user_id: int
    start_date: str
    end_date: str
    completed: Optional[bool] = False


class CourseJoinResponse(BaseJSONResponse):
    data: CourseJoinResponseData


class CourseJoinByIdData(BaseModel):
    id: int
    course_id: int


class CourseJoinByIdRequest(BaseJSONRequest):
    data: CourseJoinData


class CourseCloseData(BaseModel):
    course_id: int


class CourseCloseRequest(BaseJSONRequest):
    data: CourseCloseData


class CourseCloseByIdData(BaseModel):
    id: int
    course_id: int


class CourseCloseByIdRequest(BaseJSONRequest):
    data: CourseCloseByIdData


class CoursesAllResponseData(BaseModel):
    id: int
    name: str
    description: str
    featured: Optional[bool] = False
    enrolled: Optional[bool] = False
    is_dynamic_course: Optional[bool] = False
    total_lessons_count: Optional[int] = 0
    total_completed_lessons_count: Optional[int] = 0
    lang: Optional[str] = None
    tags: Optional[list[str]] = []
    lessons: Optional[Any] = []


class CoursesAllResponseDataCollection(BaseCollectionModel[CoursesAllResponseData]):
    class Config:
        validate_assignment_strict = False


class CoursesAllResponse(BaseJSONResponse):
    data: list[CoursesAllResponseData]


class EnrolledCoursesAllResponseData(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    description: str
    featured: Optional[bool] = False
    enrolled: Optional[bool] = False
    is_dynamic_course: Optional[bool] = False
    total_lessons_count: Optional[int] = 0
    total_completed_lessons_count: Optional[int] = 0
    lang: Optional[str] = None
    tags: Optional[list[str]] = []
    lessons: Optional[Any] = []


class EnrolledCoursesAllResponseDataCollection(
    BaseCollectionModel[EnrolledCoursesAllResponseData]
):
    class Config:
        validate_assignment_strict = False


class EnrolledCoursesAllResponse(BaseJSONResponse):
    data: list[EnrolledCoursesAllResponseData]
