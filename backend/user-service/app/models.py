from bson import ObjectId
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PyObjectId(ObjectId):
    """Custom Pydantic Type for MongoDB ObjectId"""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class UserBase(BaseModel):
    phoneNumber: str
    name: Optional[str] = None
    surname: Optional[str] = None
    lastname: Optional[str] = None
    birthdate: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")  # Convert _id to string
    phoneNumber: str
    verified: bool
    createdAt: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class User(UserBase):
    id: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    phoneNumber: Optional[str] = None
