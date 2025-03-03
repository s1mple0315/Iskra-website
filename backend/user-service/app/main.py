from fastapi import FastAPI
from app.database import connect_redis
from app.routers import auth

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await connect_redis() 

app.include_router(auth.router, prefix="/api/v1/auth")

@app.get("/")
def read_root():
    return {"message": "Welcome to the User Service"}