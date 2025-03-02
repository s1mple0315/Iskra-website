from fastapi import FastAPI, Depends
from app.database import get_database, close_database_connection
from app.routers import orders

app = FastAPI()

app.include_router(orders.router)

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
    allow_origins=["http://localhost:5173", "http://localhost:5173/", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Example usage in a route
from motor.motor_asyncio import AsyncIOMotorDatabase


@app.get("/test-db")
async def test_db(db: AsyncIOMotorDatabase = Depends(get_database)):
    return {"message": "Database connected"}
