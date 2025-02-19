from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import products
from app.database import connect_redis, initialize_indexes
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/","http://localhost:5173","http://localhost:3000","http://localhost:3000/"],  
    allow_credentials=True,
    allow_methods=[""],  
    allow_headers=["*"],  
)

@app.on_event("startup")
async def startup_event():
    print("🔄 Initializing services...")
    await connect_redis() 
    await initialize_indexes()  
    
app.include_router(products.router) 

@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Service"}
