from fastapi import FastAPI, HTTPException, Request, Depends
import httpx
from auth import verify_token
from config import SERVICES

app = FastAPI(title="API Gateway")

async def proxy_request(service: str, path: str, method: str = "GET", request: Request = None, data=None):
    """Proxy request to the correct microservice."""
    url = f"{SERVICES[service]}{path}/"  # Add trailing slash

    async with httpx.AsyncClient() as client:
        response = await client.request(method, url, json=data)

    print(f"Request to {url} returned status {response.status_code}")
    print(f"Response content: {response.text}")

    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    return response.json()


# 🛠 AUTHENTICATED ROUTES (PROTECTED) 

@app.get("/api/v1/users/me")
async def get_current_user(user=Depends(verify_token)):
    """Retrieve current user data (protected route)."""
    return await proxy_request("user", "/api/v1/auth/me", "GET")

@app.post("/api/v1/products", dependencies=[Depends(verify_token)])
async def create_product(request: Request, user=Depends(verify_token)):
    """Only admin users can create products."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: Admins only")

    data = await request.json()
    return await proxy_request("products", "/api/v1/products", "POST", request, data)

@app.delete("/api/v1/products/{product_id}", dependencies=[Depends(verify_token)])
async def delete_product(product_id: str, user=Depends(verify_token)):
    """Only admin users can delete products."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: Admins only")

    return await proxy_request("products", f"/api/v1/products/{product_id}", "DELETE")

# 🛒 ORDER SERVICE (Placeholder)
@app.post("/api/v1/orders", dependencies=[Depends(verify_token)])
async def create_order(request: Request, user=Depends(verify_token)):
    """Place an order (future order-service integration)."""
    data = await request.json()
    return await proxy_request("orders", "/api/v1/orders", "POST", request, data)

# 🛍 PUBLIC ROUTES (NO AUTH NEEDED)

@app.get("/api/v1/products")
async def list_products():
    """Public: List all products."""
    return await proxy_request("products", "/api/v1/products", "GET")

@app.get("/api/v1/products/{product_id}")
async def get_product(product_id: str):
    """Public: Get a product by ID."""
    return await proxy_request("products", f"/api/v1/products/{product_id}", "GET")

@app.get("/")
def read_root():
    return {"message": "Welcome to the API Gateway"}
