from typing import Any, Optional
from pydantic import BaseModel


class BaseJSONRequest(BaseModel):
    data: dict


class BaseJSONResponse(BaseModel):
    data: Any
    error: Optional[str] = None
