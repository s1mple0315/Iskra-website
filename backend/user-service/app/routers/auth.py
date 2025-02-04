from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import uuid
from app.models import UserCreate, User, Token, TokenData, UserBase, UserInDB
from app.database import get_database
from bson import ObjectId
from pydantic import EmailStr
from typing import Optional
import os

router = APIRouter()

# Security settings
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Load environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user(email: EmailStr):
    db = get_database()
    user = await db.users.find_one({"email": email})
    if user:
        return UserInDB(**user, id=user["_id"])  # Return UserInDB
    return None

async def authenticate_user(email: EmailStr, password: str):
    user = await get_user(email)
    if not user or not verify_password(password, user.password):  # Use UserInDB here
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Routes
@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = user.dict()
    new_user["password"] = hashed_password  # Ensure the password is stored
    result = await db.users.insert_one(new_user)
    created_user = await db.users.find_one({"_id": result.inserted_id})

    # Return the User model without exposing the password
    return User(**created_user, id=created_user["_id"])

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=User, status_code=status.HTTP_200_OK)
async def update_user_profile(
    updated_data: UserBase,
    current_user: User = Depends(get_current_user)
):
    db = get_database()
    user_data = updated_data.dict(exclude_unset=True)

    if "password" in user_data:
        user_data["password"] = get_password_hash(user_data["password"])

    result = await db.users.update_one({"_id": current_user.id}, {"$set": user_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update user profile")

    updated_user = await db.users.find_one({"_id": current_user.id})
    return User(**updated_user, id=updated_user["_id"])

@router.post("/register-admin", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_admin(user: UserCreate):
    if user.role != "admin":
        raise HTTPException(status_code=400, detail="Invalid role for admin registration")

    db = get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = user.dict()
    new_user["password"] = hashed_password
    result = await db.users.insert_one(new_user)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    return User(**created_user, id=result.inserted_id)

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def initiate_password_reset(email: EmailStr):
    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = str(uuid.uuid4())
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_token_expires": datetime.utcnow() + timedelta(hours=1)}}
    )

    print(f"Password reset token sent to {email}: {reset_token}")
    return {"message": "Password reset email sent"}

@router.post("/reset-password-confirm", status_code=status.HTTP_200_OK)
async def confirm_password_reset(token: str, new_password: str):
    db = get_database()
    user = await db.users.find_one({"reset_token": token, "reset_token_expires": {"$gt": datetime.utcnow()}})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    hashed_password = get_password_hash(new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_password, "reset_token": None, "reset_token_expires": None}}
    )

    return {"message": "Password reset successful"}

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(current_user: User = Depends(get_current_user)):
    db = get_database()
    result = await db.users.delete_one({"_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")