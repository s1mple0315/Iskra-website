from fastapi import APIRouter, HTTPException, status, Depends, Body
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
import os

from app.models import UserCreate, User, Token, TokenData, UserInDB
from app.database import get_database

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Generate JWT access token with expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate JWT token and retrieve user"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if not phone_number:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db = get_database()
    user = await db.users.find_one({"phoneNumber": phone_number})

    if not user:
        raise credentials_exception

    # ✅ Convert ObjectId to string before returning
    user["_id"] = str(user["_id"])
    return UserInDB(**user)


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """Register new user with phone number, returning JWT token"""
    try:
        db = get_database()
        existing_user = await db.users.find_one({"phoneNumber": user.phoneNumber})

        if existing_user:
            await db.users.update_one(
                {"phoneNumber": user.phoneNumber},
                {"$set": {"lastVerified": datetime.utcnow()}},
            )
            access_token = create_access_token(
                {"sub": user.phoneNumber}
            )  # ✅ Generate token
            return {
                "user": User(**existing_user, id=str(existing_user["_id"])),
                "token": access_token,
            }  # ✅ Return token

        new_user = {
            "phoneNumber": user.phoneNumber,
            "verified": True,
            "createdAt": datetime.utcnow(),
        }
        result = await db.users.insert_one(new_user)
        created_user = await db.users.find_one({"_id": result.inserted_id})
        access_token = create_access_token(
            {"sub": user.phoneNumber}
        )  # ✅ Generate token
        return {
            "user": User(**created_user, id=str(created_user["_id"])),
            "token": access_token,
        }  # ✅ Return token

    except Exception as e:
        print("❌ ERROR in register_user:", str(e))  # ✅ Log error in console
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile", response_model=User)
async def get_profile(current_user: UserInDB = Depends(get_current_user)):
    user_dict = current_user.dict()  # ✅ Convert Pydantic model to dict
    user_dict["id"] = str(user_dict["_id"])  # ✅ Convert ObjectId to string
    user_dict.pop("_id", None)  # ✅ Remove `_id` field if needed

    return User(**user_dict)


@router.put("/profile", response_model=User)
async def update_profile(
    name: Optional[str] = Body(None),
    surname: Optional[str] = Body(None),
    lastname: Optional[str] = Body(None),
    birthdate: Optional[str] = Body(None),
    current_user: UserInDB = Depends(get_current_user),
):
    """Update user profile (name, surname, lastname, birthdate)"""
    update_data = {}

    if name:
        update_data["name"] = name
    if surname:
        update_data["surname"] = surname
    if lastname:
        update_data["lastname"] = lastname
    if birthdate:
        try:
            datetime.strptime(birthdate, "%d:%m:%Y")
            update_data["birthdate"] = birthdate
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid birthdate format. Use dd:mm:yyyy"
            )

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    db = get_database()
    await db.users.update_one(
        {"phoneNumber": current_user.phoneNumber}, {"$set": update_data}
    )
    updated_user = await db.users.find_one({"phoneNumber": current_user.phoneNumber})

    return User(**updated_user, id=str(updated_user["_id"]))
