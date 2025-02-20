from motor.motor_asyncio import AsyncIOMotorClient
import aioredis
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Global Redis variable
redis = None

async def connect_redis():
    """Connect to Redis if not already connected."""
    global redis
    if redis is None:
        redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
        print("✅ Redis Connected Successfully")
    else:
        print("⚠️ Redis already connected.")

def get_database():
    return db

def get_redis():
    """Returns the Redis instance after checking it is initialized."""
    if redis is None:
        raise RuntimeError("❌ Redis is not initialized. Call `connect_redis()` first.")
    return redis