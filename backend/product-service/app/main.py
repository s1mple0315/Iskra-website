from fastapi import FastAPI
from app.routers import products
from app.database import initialize_text_index
import asyncio

app = FastAPI()

app.include_router(products.router)

@app.on_event("startup")
async def startup_event():
    # Initialize the text index on startup
    await initialize_text_index()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Service"}