from typing import Optional
from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest


class KnowledgeTestCreateRequestData(BaseModel):
    name: str
    lesson_id: int


class KnowledgeTestCreateRequest(BaseJSONRequest):
    data: KnowledgeTestCreateRequestData


class KnowledgeTestUserResultsCreateRequestDataQuestion(BaseModel):
    question_id: int
    answer: str


class KnowledgeTestQuestionsCreateRequestData(BaseModel):
    knowledge_test_id: int
    question: Optional[str] = None
    answer: Optional[str] = None
    bulk: Optional[bool] = False
    questions: Optional[list[KnowledgeTestUserResultsCreateRequestDataQuestion]] = None


class KnowledgeTestQuestionsCreateRequest(BaseJSONRequest):
    data: KnowledgeTestQuestionsCreateRequestData


class KnowledgeTestUserResultsCreateRequestDataResults(BaseModel):
    question_id: int
    answer: str


class KnowledgeTestUserResultsCreateRequestData(BaseModel):
    knowledge_test_id: int
    results: list[KnowledgeTestUserResultsCreateRequestDataResults]


class KnowledgeTestUserResultsCreateRequest(BaseJSONRequest):
    data: KnowledgeTestUserResultsCreateRequestData
