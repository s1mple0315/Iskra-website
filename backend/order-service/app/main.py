import logging
from fastapi import FastAPI, Depends
from app.database import get_database, close_database_connection
from app.routers import orders

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    # Optionally initialize or test DB here
    pass


@app.on_event("shutdown")
async def shutdown_event():
    await close_database_connection()


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)
# Example usage in a route
from motor.motor_asyncio import AsyncIOMotorDatabase


@app.get("/test-db")
async def test_db(db: AsyncIOMotorDatabase = Depends(get_database)):
    return {"message": "Database connected"}
