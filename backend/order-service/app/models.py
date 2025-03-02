from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from enum import Enum
from datetime import datetime


def object_id_to_str(oid):
    return str(oid) if isinstance(oid, ObjectId) else oid


class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItem(BaseModel):
    product_id: str = Field(..., description="ID of the product from product-service")
    name: str = Field(..., description="Name of the product")
    price: float = Field(..., ge=0, description="Price per unit")
    quantity: int = Field(..., ge=1, description="Number of units ordered")


class OrderBase(BaseModel):
    user_id: str = Field(..., description="ID of the user placing the order")
    items: List[OrderItem] = Field(..., description="List of items in the order")
    total_amount: float = Field(..., ge=0, description="Total cost of the order")
    shipping_address: str = Field(..., description="Shipping address")
    status: OrderStatus = Field(default=OrderStatus.PENDING, description="Order status")


class Order(OrderBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: Optional[str] = Field(
        default_factory=lambda: datetime.now().isoformat()
    )
    updated_at: Optional[str] = Field(
        default_factory=lambda: datetime.now().isoformat()
    )

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True
