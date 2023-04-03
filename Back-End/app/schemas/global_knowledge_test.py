from typing import Optional
from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest


class GlobalKnowledgeTestCreateRequestData(BaseModel):
    name: str


class GlobalKnowledgeTestCreateRequest(BaseJSONRequest):
    data: GlobalKnowledgeTestCreateRequestData


class GlobalKnowledgeTestQuestionsCreateRequestDataQuestions(BaseModel):
    question: str
    answer: str
    lesson_id: int


class GlobalKnowledgeTestQuestionsCreateRequestData(BaseModel):
    global_knowledge_test_id: int
    question: Optional[str] = None
    answer: Optional[str] = None
    lesson_id: Optional[int] = None
    bulk: Optional[bool] = False
    questions: Optional[
        list[GlobalKnowledgeTestQuestionsCreateRequestDataQuestions]
    ] = None


class GlobalKnowledgeTestQuestionsCreateRequest(BaseJSONRequest):
    data: GlobalKnowledgeTestQuestionsCreateRequestData


class GlobalKnowledgeTestUserResultsCreateRequestDataResults(BaseModel):
    question_id: int
    answer: str


class GlobalKnowledgeTestUserResultsCreateRequestData(BaseModel):
    global_knowledge_test_id: int
    results: list[GlobalKnowledgeTestUserResultsCreateRequestDataResults]


class GlobalKnowledgeTestUserResultsCreateRequest(BaseJSONRequest):
    data: GlobalKnowledgeTestUserResultsCreateRequestData
