from typing import Union, Optional
from pydantic import BaseModel

from app.schemas.base import BaseJSONRequest


class AnswerCreateData(BaseModel):
    lesson_id: int
    final_answer: str
    answer_check_rule: Optional[str] = None


class AnswerCreateRequest(BaseJSONRequest):
    data: AnswerCreateData


class AnswerCheckData(BaseModel):
    lesson_id: int
    enrolled_lesson_id: Optional[int] = None
    dynamic_lesson_id: Optional[int] = None
    answer: Union[str, list]
    answer_check_rule: Optional[str] = None


class AnswerCheckRequest(BaseJSONRequest):
    data: AnswerCheckData


class AnswerEditData(BaseModel):
    answer_id: int
    lesson_id: int
    final_answer: str
    answer_check_rule: Optional[str] = None


class AnswerEditRequest(BaseJSONRequest):
    data: AnswerEditData


class AnswerDeleteData(BaseModel):
    answer_id: int


class AnswerDeleteRequest(BaseJSONRequest):
    data: AnswerDeleteData
