from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# Load environment variables
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

def get_database():
    return db

# Function to create a text index on the products collection
async def initialize_text_index():
    db = get_database()
    await db.products.create_index(
        [("name", "text"), ("description", "text")],
        weights={"name": 5, "description": 1},
        default_language="english"
    )