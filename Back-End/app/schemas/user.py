from pydantic import BaseModel, EmailStr
from app.schemas.base import BaseJSONResponse


class UserCreate(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str


class Role(BaseModel):
    role_id: int
    role_name: str


class LoginResponseData(BaseModel):
    username: str
    zutID: str
    name: str
    lastName: str
    email: EmailStr
    token: Token
    role: Role


class LoginResponse(BaseJSONResponse):
    data: LoginResponseData


class UserByUsername(BaseModel):
    username: str


class RoleCreate(BaseModel):
    role_name: str
