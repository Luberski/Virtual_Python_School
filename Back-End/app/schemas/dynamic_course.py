from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class DynamicCourseSurveyAnswerCreateRequestData(BaseModel):
    question_id: int
    name: str
    rule_type: int
    rule_value: int


class DynamicCourseSurveyAnswerCreateRequest(BaseJSONRequest):
    data: DynamicCourseSurveyAnswerCreateRequestData


class DynamicCourseSurveyAnswerCreateResponseData(BaseModel):
    id: int
    question_id: int
    name: str
    rule_type: int
    rule_value: int


class DynamicCourseSurveyAnswerCreateResponse(BaseJSONResponse):
    data: DynamicCourseSurveyAnswerCreateResponseData


class DynamicCourseSurveyQuestionCreateRequestData(BaseModel):
    question: str
    survey_id: int


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
