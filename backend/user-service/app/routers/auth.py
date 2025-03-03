import uuid
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.models import UserCreate, User, Token, TokenData, UserBase, UserInDB
from app.database import get_database
from pydantic import EmailStr
from typing import Optional
import os
import random
import string

router = APIRouter()

# Security settings
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Load environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# In-memory storage for fake OTPs (key: email, value: {otp, expiry})
fake_otps = {}

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user(email: EmailStr):
    db = get_database()
    user = await db.users.find_one({"email": email})
    if user:
        return UserInDB(**user, id=str(user["_id"]))
    return None

async def authenticate_user(email: EmailStr, password: str):
    user = await get_user(email)
    if not user or not verify_password(password, user.password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
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
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = await get_user(token_data.email)
    if user is None:
        raise credentials_exception
    return user

# OTP Endpoints
@router.post("/otp/generate", status_code=status.HTTP_200_OK)
async def generate_otp(email: EmailStr):
    """Generate a fake OTP for the user."""
    user = await get_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp = ''.join(random.choices(string.digits, k=6))  # 6-digit OTP
    expiry = datetime.utcnow() + timedelta(minutes=5)  # Valid for 5 minutes
    fake_otps[email] = {"otp": otp, "expiry": expiry}
    return {"message": "Fake OTP generated", "email": email, "otp": otp}  # Expose OTP for testing

@router.post("/otp/verify", status_code=status.HTTP_200_OK)
async def verify_otp(email: EmailStr, otp: str):
    """Verify the fake OTP for the user."""
    stored = fake_otps.get(email)
    if not stored or datetime.now() > stored["expiry"]:
        raise HTTPException(status_code=400, detail="OTP expired or invalid")
    if stored["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    del fake_otps[email]  # Remove OTP after successful verification
    return {"message": "OTP verified successfully", "email": email}

# Existing endpoints (register, token, etc.) remain unchanged...

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate OTP for verification (optional step)
    await generate_otp(user.email)  # Simulate OTP generation during registration

    hashed_password = get_password_hash(user.password)
    new_user = user.dict()
    new_user["password"] = hashed_password
    result = await db.users.insert_one(new_user)
    created_user = await db.users.find_one({"_id": result.inserted_id})

    return User(**created_user, id=str(created_user["_id"]))

# Other endpoints (me, update_user_profile, etc.) remain unchanged