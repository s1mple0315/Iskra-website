from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from fastapi import HTTPException

load_dotenv()

# Load environment variables with validation
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI or not DB_NAME:
    raise ValueError("MONGO_URI and DB_NAME must be set in the .env file")

# Initialize MongoDB client with connection pooling options
client = AsyncIOMotorClient(
    MONGO_URI,
    maxPoolSize=10,  # Adjust based on your app's needs
    minPoolSize=1
)
db = client[DB_NAME]

async def get_database():
    """
    Provides the MongoDB database instance.
    Use this as a FastAPI dependency.
    """
    try:
        # Test connection on first use (optional)
        await db.command("ping")
        return db
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

# Optional: Cleanup function for app shutdown
async def close_database_connection():
    client.close()