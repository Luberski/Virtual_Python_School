from typing import Optional
from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class DynamicCourseSurveyAnswerItem(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    rule_type: Optional[int] = None
    rule_value: Optional[int] = None


class DynamicCourseSurveyAnswerCreateRequestData(BaseModel):
    question_id: int
    id: Optional[int] = None
    name: Optional[str] = None
    rule_type: Optional[int] = None
    rule_value: Optional[int] = None
    bulk: Optional[bool] = False
    answers: Optional[list[DynamicCourseSurveyAnswerItem]] = None


class DynamicCourseSurveyAnswerCreateRequest(BaseJSONRequest):
    data: DynamicCourseSurveyAnswerCreateRequestData


class DynamicCourseSurveyAnswerCreateResponseData(BaseModel):
    id: int
    question_id: int
    name: str
    rule_type: int
    rule_value: int


class DynamicCourseSurveyWithAnswersCreateRequestData(BaseModel):
    question: str
    survey_id: int
    answers: Optional[list[DynamicCourseSurveyAnswerItem]] = None


class DynamicCourseSurveyWithAnswersCreateRequest(BaseJSONRequest):
    data: DynamicCourseSurveyWithAnswersCreateRequestData


class DynamicCourseSurveyAnswerCreateResponse(BaseJSONResponse):
    data: DynamicCourseSurveyAnswerCreateResponseData


class DynamicCourseSurveyQuestionCreateRequestData(BaseModel):
    question: Optional[str] = None
    survey_id: int
    bulk: Optional[bool] = False
    questions: Optional[list] = None


class DynamicCourseSurveyQuestionCreateRequest(BaseJSONRequest):
    data: DynamicCourseSurveyQuestionCreateRequestData


class DynamicCourseSurveyQuestionCreateResponseData(BaseModel):
    id: int
    survey_id: int
    question: str


class DynamicCourseSurveyQuestionCreateResponse(BaseJSONResponse):
    data: DynamicCourseSurveyQuestionCreateResponseData


class DynamicCourseSurveyCreateResponseData(BaseModel):
    id: int
    name: str


class DynamicCourseSurveyCreateResponse(BaseJSONResponse):
    data: DynamicCourseSurveyCreateResponseData


class DynamicCourseSurveyCreateRequestData(BaseModel):
    name: str
    featured: Optional[bool] = False


class DynamicCourseSurveyCreateRequest(BaseJSONRequest):
    data: DynamicCourseSurveyCreateRequestData


class DynamicCourseSurveyUserResultsSurveyResultsData(BaseModel):
    question_id: int
    answer_id: int


class DynamicCourseSurveyUserResultsCreateRequestData(BaseModel):
    survey_id: int
    survey_results: list[DynamicCourseSurveyUserResultsSurveyResultsData]


class DynamicCourseSurveyUserResultsCreateRequest(BaseJSONRequest):
    data: DynamicCourseSurveyUserResultsCreateRequestData


class DynamicCourseCreateRequestData(BaseModel):
    survey_id: int
    name: str


class DynamicCourseCreateRequest(BaseJSONRequest):
    data: DynamicCourseCreateRequestData
