from typing import Union
from pydantic import BaseModel

from app.schemas.base import BaseJSONRequest


class AnswerCreateData(BaseModel):
    id_lesson: int
    final_answer: str


class AnswerCreateRequest(BaseJSONRequest):
    data: AnswerCreateData


class AnswerCheckData(BaseModel):
    id_lesson: int
    answer: Union[str, list]


class AnswerCheckRequest(BaseJSONRequest):
    data: AnswerCheckData


class AnswerEditData(BaseModel):
    id_answer: int
    id_lesson: int
    final_answer: str


class AnswerEditRequest(BaseJSONRequest):
    data: AnswerEditData


class AnswerDeleteData(BaseModel):
    id_answer: int


class AnswerDeleteRequest(BaseJSONRequest):
    data: AnswerDeleteData
