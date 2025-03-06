from __future__ import annotations  # Поддержка аннотаций строками

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from bson import ObjectId

def object_id_to_str(oid):
    return str(oid) if isinstance(oid, ObjectId) else oid

class CategoryBase(BaseModel):
    name: str = Field(..., description="The name of the category")
    parent_id: Optional[str] = Field(None, description="ID of the parent category (if it's a subcategory)")
    image: Optional[str] = Field(None, description="URL or path to the category image")

class ChildCategory(CategoryBase):
    id: str
    subcategories: List["ChildCategory"] = Field(default_factory=list, description="List of nested subcategories")
    products: List[str] = Field(default_factory=list, description="List of product IDs")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True

class ParentCategory(CategoryBase):
    id: str
    subcategories: List["ChildCategory"] = Field(default_factory=list, description="List of subcategories")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: object_id_to_str}

class ProductBase(BaseModel):
    name: str = Field(..., description="The name of the product")
    description: str = Field(..., description="A brief description of the product")
    price: float = Field(..., description="The price of the product")
    stock: int = Field(..., description="The available stock of the product")
    category_id: str = Field(..., description="ID of the category this product belongs to")
    brand: Optional[str] = Field(None, description="The brand of the product")
    images: List[str] = Field(default_factory=list, description="List of image URLs for the product")
    memory: Optional[str] = None
    processor_type: Optional[str] = None
    isbn: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None
    size: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict, description="Custom attributes")

class Product(ProductBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
