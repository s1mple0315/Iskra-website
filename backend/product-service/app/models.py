from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId

# Convert ObjectId to string helper function
def object_id_to_str(oid):
    return str(oid) if isinstance(oid, ObjectId) else oid

# ----------------- CATEGORY MODELS ----------------- #
class CategoryBase(BaseModel):
    """Base schema for categories."""
    name: str = Field(..., description="The name of the category")
    parent_id: Optional[str] = Field(None, description="ID of the parent category (if it's a subcategory)")

class ParentCategory(BaseModel):
    """Schema for parent categories that contain subcategories."""
    id: str = Field(..., alias="_id")  # ✅ Fix: Alias _id to ensure compatibility
    name: str = Field(..., description="The name of the category")
    parent_id: Optional[str] = None
    subcategories: List[str] = Field(default_factory=list, description="List of subcategory IDs")

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True  # ✅ Ensure alias `_id` is properly mapped
        

class ChildCategory(BaseModel):
    """Schema for child categories that contain products."""
    id: str = Field(..., alias="_id")  # ✅ Fix: Ensure `_id` is properly aliased
    name: str
    parent_id: str
    products: List[str] = Field(default_factory=list)

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True  # ✅ Ensure alias `_id` is properly mapped
        
# ----------------- PRODUCT MODELS ----------------- #
class ProductBase(BaseModel):
    """Base schema for products."""
    name: str = Field(..., description="The name of the product")
    description: str = Field(..., description="A brief description of the product")
    price: float = Field(..., description="The price of the product")
    stock: int = Field(..., description="The available stock of the product")
    category_id: str = Field(..., description="ID of the child category this product belongs to")
    brand: Optional[str] = Field(None, description="The brand of the product")

    # Indexed common attributes for fast searching
    memory: Optional[str] = None  # Electronics
    processor_type: Optional[str] = None  # Electronics
    isbn: Optional[str] = None  # Books
    color: Optional[str] = None  # Fashion, accessories
    material: Optional[str] = None  # Fashion, sports gear
    size: Optional[str] = None  # Clothes, shoes, bags

    # Flexible attributes for new product fields
    attributes: dict = Field(default_factory=dict, description="Custom attributes")

class Product(ProductBase):
    """Schema for products stored in the database."""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
