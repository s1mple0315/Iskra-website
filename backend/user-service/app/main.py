from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_redis
from app.routers import auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/", "http://localhost:5173", "http://localhost:3000", "http://localhost:3000/", "http://localhost:4173", "http://localhost:4173/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await connect_redis() 

app.include_router(auth.router, prefix="/api/v1/auth")

@app.get("/")
def read_root():
    return {"message": "Welcome to the User Service"}