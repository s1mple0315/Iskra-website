from fastapi import APIRouter, HTTPException, Request
import httpx
from config import SERVICES

router = APIRouter()

async def forward_request(service_name: str, request: Request):
    """Forward the request to the appropriate microservice."""
    service_url = SERVICES.get(service_name)
    if not service_url:
        raise HTTPException(status_code=404, detail=f"Service {service_name} not found")

    async with httpx.AsyncClient() as client:
        method = request.method.lower()
        url = f"{service_url}{request.url.path.replace('/api/v1', '')}"  # Adjust paths
        params = request.query_params
        body = await request.json() if request.method in ["POST", "PUT"] else None

        response = await getattr(client, method)(url, params=params, json=body)

    return response.json()

# Define API routes
@router.api_route("/{service_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway_handler(service_name: str, path: str, request: Request):
    """Handles all API requests and forwards them to the correct service."""
    return await forward_request(service_name, request)
