from fastapi import FastAPI, Depends
from app.database import get_database, close_database_connection
<<<<<<< HEAD
from app.routers import orders

app = FastAPI()

app.include_router(orders.router)
=======

app = FastAPI()

>>>>>>> 79865be076c61b080c7f17d0a92d3d5c453e1b12

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
<<<<<<< HEAD
    allow_origins=["*"],
=======
    allow_origins=["http://localhost:5173", "http://localhost:5173/", "http://localhost"],
>>>>>>> 79865be076c61b080c7f17d0a92d3d5c453e1b12
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Example usage in a route
from motor.motor_asyncio import AsyncIOMotorDatabase


@app.get("/test-db")
async def test_db(db: AsyncIOMotorDatabase = Depends(get_database)):
    return {"message": "Database connected"}
