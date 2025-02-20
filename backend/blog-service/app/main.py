from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import blogs
from app.database import connect_redis
import asyncio

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    print("🔄 Initializing services...")
    await connect_redis()
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/","http://localhost:5173","http://localhost:3000","http://localhost:3000/"],  
    allow_credentials=True,
    allow_methods=[""],  
    allow_headers=["*"],  
)
    
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(blogs.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Blog Service"}