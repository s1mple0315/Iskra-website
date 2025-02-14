from fastapi import FastAPI, Request, Depends
import uvicorn
from routes import router
from middleware import verify_jwt
from database import connect_redis

app = FastAPI(title="API Gateway", description="Handles routing and authentication")

@app.on_event("startup")
async def startup():
    await connect_redis()

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """Verify JWT token for protected routes."""
    if request.url.path.startswith("/api/v1/secure"):  # Protect sensitive endpoints
        await verify_jwt(request)

    response = await call_next(request)
    return response

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
