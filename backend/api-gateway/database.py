import aioredis
import os

REDIS_URI = os.getenv("REDIS_URL", "redis://localhost:6379")
redis = None

async def connect_redis():
    """Connect to Redis on startup."""
    global redis
    redis = await aioredis.from_url(REDIS_URI, decode_responses=True)
    print("✅ Redis Connected")

async def get_redis():
    """Return the Redis instance."""
    return redis
