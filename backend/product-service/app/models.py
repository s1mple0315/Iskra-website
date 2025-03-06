from pydantic import BaseModel, Field, validator
from app.database import get_database
from typing import List, Optional
from bson import ObjectId


def object_id_to_str(oid):
    return str(oid) if isinstance(oid, ObjectId) else oid


class CategoryBase(BaseModel):
    """Base schema for categories."""

    name: str = Field(..., description="The name of the category")
    parent_id: Optional[str] = Field(
        None, description="ID of the parent category (if it's a subcategory)"
    )


class ParentCategory(CategoryBase):
    """Schema for top-level categories with nested subcategories."""

    id: str = Field(..., alias="_id")
    image: Optional[str] = Field(None, description="URL of the category image")
    subcategories: List["ChildCategory"] = Field(
        default_factory=list, description="List of child categories"
    )

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True
        arbitrary_types_allowed = True


class ChildCategory(CategoryBase):
    """Schema for child categories with nested subcategories; products allowed only for deeper levels."""

    id: str = Field(..., alias="_id")
    image: Optional[str] = Field(None, description="URL of the category image")
    subcategories: List["ChildCategory"] = Field(
        default_factory=list, description="List of nested subcategories"
    )
    products: List[str] = Field(
        default_factory=list,
        description="List of product IDs (only for sub-subcategories)",
    )

    @validator("parent_id", pre=True)
    def convert_objectid_to_str(cls, v):
        """Convert ObjectId to string before validation."""
        return str(v) if isinstance(v, ObjectId) else v

    @validator("products", always=True)
    def validate_products(cls, v, values):
        """Ensure products are only allowed if the category has a parent that is not a top-level category."""
        if v and values.get("parent_id"):
            db = get_database()
            parent = db.categories.find_one({"_id": ObjectId(values["parent_id"])})
            if parent and not parent.get("parent_id"):
                raise ValueError(
                    "Products are not allowed for subcategories of parent categories."
                )
        return v

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True
        arbitrary_types_allowed = True


ParentCategory.update_forward_refs()
ChildCategory.update_forward_refs()


class ProductBase(BaseModel):
    """Base schema for products."""

    name: str = Field(..., description="The name of the product")
    description: str = Field(..., description="A brief description of the product")
    price: float = Field(..., description="The price of the product")
    stock: int = Field(..., description="The available stock of the product")
    category_id: str = Field(
        ..., description="ID of the category this product belongs to"
    )
    brand: Optional[str] = Field(None, description="The brand of the product")
    images: List[str] = Field(
        default_factory=list, description="List of image URLs for the product"
    )
    memory: Optional[str] = None
    processor_type: Optional[str] = None
    isbn: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None
    size: Optional[str] = None
    attributes: dict = Field(default_factory=dict, description="Custom attributes")


class Product(ProductBase):
    """Schema for products stored in the database."""

    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
