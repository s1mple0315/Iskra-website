import aioredis
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
REDIS_URI = os.getenv("REDIS_URL", "redis://localhost:6379")

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

# Global Redis variable
redis = None  

async def connect_redis():
    """Connect to Redis if not already connected"""
    global redis
    if redis is None:
        redis = await aioredis.from_url(REDIS_URI, decode_responses=True)
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

# ----------------- ✅ FIX: Define `initialize_indexes()` ----------------- #
async def initialize_indexes():
    """Create necessary indexes for efficient queries in MongoDB."""

    # Product indexes
    await db.products.create_index([("name", "text"), ("description", "text")], 
        weights={"name": 5, "description": 1}, 
        default_language="english"
    )  # Enables text search

    await db.products.create_index("category_id")  # Speeds up category filtering
    await db.products.create_index("brand")  # Faster brand-based queries
    await db.products.create_index("price")  # Useful for sorting & filtering

    # Category indexes
    await db.categories.create_index("name")  # Speeds up category lookups
    await db.categories.create_index("parent_id")  # Helps with subcategory retrieval

    print("✅ MongoDB Indexes Initialized!")
