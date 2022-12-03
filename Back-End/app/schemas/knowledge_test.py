from typing import Optional
from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest


class KnowledgeTestCreateRequestData(BaseModel):
    name: str
    lesson_id: int


class KnowledgeTestCreateRequest(BaseJSONRequest):
    data: KnowledgeTestCreateRequestData


class KnowledgeTestQuestionsCreateRequestData(BaseModel):
    knowledge_test_id: int
    question: Optional[str] = None
    answer: str
    bulk: Optional[bool] = False
    questions: Optional[list] = None


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
