import aioredis
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
REDIS_URI = os.getenv("REDIS_URL")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

redis = None

async def connect_redis():
    """Connects to Redis"""
    global redis
    redis = await aioredis.from_url(REDIS_URI, decode_responses=True)
    print("✅ Redis Connected Successfully")

def get_database():
    return db