from typing import Optional
from pydantic import BaseModel


class BaseJSONRequest(BaseModel):
    data: dict


class BaseJSONResponse(BaseModel):
    data: dict
    error: Optional[str] = None
