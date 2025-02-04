from fastapi import FastAPI
from app.routers import products

app = FastAPI()

app.include_router(products.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Service"}