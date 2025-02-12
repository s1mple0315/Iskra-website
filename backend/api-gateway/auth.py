from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# OAuth2 scheme for Bearer Token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")

# ✅ Ensure all env variables are loaded
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# ✅ Check if DB_NAME is loaded correctly
if not DB_NAME:
    raise ValueError("Missing DB_NAME environment variable!")

# ✅ Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def verify_token(token: str = Depends(oauth2_scheme)):
    """Verify JWT token and check user existence in MongoDB."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Check if user exists in MongoDB
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Return user data for role-based access if needed
    return {"email": user["email"], "role": user["role"]}
