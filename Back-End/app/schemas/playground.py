from pydantic import BaseModel
from app.schemas.base import BaseJSONRequest, BaseJSONResponse


class PlaygroundData(BaseModel):
    content: str


class PlaygroundRequest(BaseJSONRequest):
    data: PlaygroundData


class PlaygroundResponseData(BaseModel):
    content: str


class PlaygroundResponse(BaseJSONResponse):
    data: PlaygroundResponseData
