from typing import Union
from pydantic import BaseModel

from app.schemas.base import BaseJSONRequest


class AnswerCreateData(BaseModel):
    lesson_id: int
    final_answer: str


class AnswerCreateRequest(BaseJSONRequest):
    data: AnswerCreateData


class AnswerCheckData(BaseModel):
    lesson_id: int
    enrolled_lesson_id: int
    answer: Union[str, list]


class AnswerCheckRequest(BaseJSONRequest):
    data: AnswerCheckData


class AnswerEditData(BaseModel):
    answer_id: int
    lesson_id: int
    final_answer: str


class AnswerEditRequest(BaseJSONRequest):
    data: AnswerEditData


class AnswerDeleteData(BaseModel):
    answer_id: int


class AnswerDeleteRequest(BaseJSONRequest):
    data: AnswerDeleteData
