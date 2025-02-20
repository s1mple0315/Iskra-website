from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import blogs
from app.database import connect_redis
import asyncio

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    print("🔄 Initializing services...")
    await connect_redis()
    
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(blogs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Blog Service"}