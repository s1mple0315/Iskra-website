import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import re
import os

# Configure your MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "your_database_name"  # Replace with your database name

async def clean_subcategories():
    # Connect to MongoDB asynchronously
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    # Find all categories with subcategories
    cursor = db.categories.find({"subcategories": {"$exists": True}})
    async for cat in cursor:
        new_subs = []
        for sub in cat.get("subcategories", []):
            if isinstance(sub, dict) and "_id" in sub and re.match(r'^[0-9a-fA-F]{24}$', sub["_id"]):
                new_subs.append(sub)
        if new_subs != cat.get("subcategories", []):
            print(f"Updating category {cat['_id']} with cleaned subcategories: {new_subs}")
            await db.categories.update_one({"_id": cat["_id"]}, {"$set": {"subcategories": new_subs}})
    
    client.close()
    print("Subcategory cleaning completed.")

if __name__ == "__main__":
    asyncio.run(clean_subcategories())