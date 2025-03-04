from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from datetime import datetime, timedelta
from app.models import UserCreate, User, Token, TokenData, UserInDB, UserBase
from app.database import get_database
from pydantic import EmailStr
from typing import Optional
import os

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception
        token_data = TokenData(phoneNumber=phone_number)
    except jwt.JWTError:
        raise credentials_exception
    db = get_database()
    user = await db.users.find_one({"phoneNumber": token_data.phoneNumber})
    if not user:
        raise credentials_exception
    return UserInDB(**user, id=str(user["_id"]))


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """Register or update a user with Firebase UID and phone number."""
    db = get_database()
    existing_user = await db.users.find_one({"phoneNumber": user.phoneNumber})
    if existing_user:
        await db.users.update_one(
            {"phoneNumber": user.phoneNumber},
            {
                "$set": {
                    "full_name": user.full_name,
                    "role": user.role,
                    "lastVerified": datetime.utcnow(),
                }
            },
        )
        return User(**existing_user, id=str(existing_user["_id"]))

    new_user = {
        "phoneNumber": user.phoneNumber,
        "full_name": user.full_name,
        "role": user.role,
        "firebaseUid": None,
        "verified": True,
        "createdAt": datetime.utcnow(),
    }
    result = await db.users.insert_one(new_user)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    return User(**created_user, id=str(created_user["_id"]))


@router.get("/me", response_model=User)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user
