from bson import ObjectId
from pydantic import BaseModel, EmailStr, GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Optional
from datetime import datetime


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type, handler
    ) -> core_schema.CoreSchema:
        return core_schema.union_schema(
            [
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema(
                    [
                        core_schema.str_schema(),
                        core_schema.no_info_plain_validator_function(cls.validate),
                    ]
                ),
            ]
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema)
        json_schema.update(type="string", example="64c1a2b3f8b5e9a7b0c1d2e3")
        return json_schema


class UserBase(BaseModel):
    phoneNumber: str
    full_name: Optional[str] = None
    role: str = "user"


class UserCreate(UserBase):
    pass


class UserInDB(UserBase):
    id: Optional[PyObjectId] = None
    firebaseUid: Optional[str] = None
    verified: bool = True  # Assume verified via Firebase
    createdAt: Optional[datetime] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class User(UserBase):
    id: PyObjectId = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    phoneNumber: Optional[str] = None
