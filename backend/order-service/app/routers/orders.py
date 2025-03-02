from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from app.database import get_database
from app.models import Order, OrderBase, OrderItem, OrderStatus
from datetime import datetime
import httpx
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

# Configuration (could be moved to a config file or env vars)
PRODUCT_SERVICE_URL = (
    "http://product-service:8002/api/v1/products"  # Adjust URL as needed
)


class ProductResponse(BaseModel):
    id: str
    name: str
    price: float
    stock: int


async def fetch_product(product_id: str) -> ProductResponse:
    """Fetch product details from the product-service."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{PRODUCT_SERVICE_URL}/{product_id}")
            response.raise_for_status()
            return ProductResponse(**response.json())
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Product fetch failed: {e.response.text}",
            )
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Product service unavailable")


async def update_product_stock(product_id: str, quantity: int):
    """Update product stock via the product-service PATCH endpoint."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.patch(
                f"{PRODUCT_SERVICE_URL}/{product_id}/stock",
                json={"quantity": -quantity},  # Negative to reduce stock
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Stock update failed: {e.response.text}",
            )
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Product service unavailable")


@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderBase, db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new order with validation against product-service."""
    total_amount = 0
    items = []

    # Validate products and update stock
    for item in order.items:
        product = await fetch_product(item.product_id)
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product {product.name} (available: {product.stock})",
            )
        if item.price != product.price:
            raise HTTPException(
                status_code=400,
                detail=f"Price mismatch for product {product.name} (expected: {product.price})",
            )

        total_amount += product.price * item.quantity
        items.append(
            OrderItem(
                product_id=product.id,
                name=product.name,
                price=product.price,
                quantity=item.quantity,
            )
        )
        await update_product_stock(product.id, item.quantity)

    if abs(total_amount - order.total_amount) > 0.01:
        raise HTTPException(status_code=400, detail="Total amount mismatch")

    order_dict = order.dict()
    order_dict["items"] = [item.dict() for item in items]
    order_dict["created_at"] = datetime.now().isoformat()
    order_dict["updated_at"] = datetime.now().isoformat()

    result = await db.orders.insert_one(order_dict)
    created_order = await db.orders.find_one({"_id": result.inserted_id})
    return Order(**created_order, id=str(created_order["_id"]))


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Retrieve an order by ID."""
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order, id=str(order["_id"]))


@router.get("/user/{user_id}", response_model=List[Order])
async def get_user_orders(
    user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieve all orders for a user."""
    cursor = db.orders.find({"user_id": user_id})
    orders = [Order(**order, id=str(order["_id"])) async for order in cursor]
    return orders


@router.put("/{order_id}", response_model=Order)
async def update_order(
    order_id: str,
    update_data: OrderBase,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Update an order (e.g., status or shipping address)."""
    existing_order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if (
        update_data.items != [OrderItem(**item) for item in existing_order["items"]]
        or update_data.total_amount != existing_order["total_amount"]
    ):
        raise HTTPException(
            status_code=400, detail="Cannot modify items or total amount after creation"
        )

    update_dict = update_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.now().isoformat()

    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)}, {"$set": update_dict}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update order")

    updated_order = await db.orders.find_one({"_id": ObjectId(order_id)})
    return Order(**updated_order, id=str(updated_order["_id"]))


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Delete an order and restore product stock."""
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] not in [OrderStatus.PENDING, OrderStatus.CANCELLED]:
        raise HTTPException(
            status_code=400, detail="Can only delete pending or cancelled orders"
        )

    # Restore stock
    for item in order["items"]:
        await update_product_stock(
            item["product_id"], -item["quantity"]
        )  # Negative to increase stock

    result = await db.orders.delete_one({"_id": ObjectId(order_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete order")


@router.patch("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: str, status: OrderStatus, db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update the status of an order."""
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": status, "updated_at": datetime.now().isoformat()}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update order status")

    updated_order = await db.orders.find_one({"_id": ObjectId(order_id)})
    return Order(**updated_order, id=str(updated_order["_id"]))
