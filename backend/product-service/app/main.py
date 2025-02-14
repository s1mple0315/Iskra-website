from fastapi import FastAPI
from app.routers import products
from app.database import connect_redis, initialize_indexes
import asyncio

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    print("🔄 Initializing services...")
    await connect_redis()  # ✅ Ensure Redis initializes BEFORE loading routes
    await initialize_indexes()  # ✅ Ensure MongoDB indexes are created

app.include_router(products.router)  # ✅ Now routes will load AFTER Redis is ready

@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Service"}
