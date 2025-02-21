from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId

def object_id_to_str(oid):
    return str(oid) if isinstance(oid, ObjectId) else oid

class CategoryBase(BaseModel):
    """Base schema for categories."""
    name: str = Field(..., description="The name of the category")
    parent_id: Optional[str] = Field(None, description="ID of the parent category (if it's a subcategory)")

class ParentCategory(BaseModel):
    """Schema for parent categories that contain subcategories."""
    id: str = Field(..., alias="_id")  
    name: str = Field(..., description="The name of the category")
    parent_id: Optional[str] = None
    subcategories: List[dict] = Field(default_factory=list, description="List of subcategory IDs and Names")
    image: Optional[str] = Field(None, description="URL of the category image")
    

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True  
        

class ChildCategory(BaseModel):
    """Schema for child categories that contain products."""
    id: str = Field(..., alias="_id") 
    name: str
    parent_id: str
    image: Optional[str] = Field(None, description="URL of the category image")
    products: List[str] = Field(default_factory=list)

    class Config:
        json_encoders = {ObjectId: object_id_to_str}
        populate_by_name = True  
        
class ProductBase(BaseModel):
    """Base schema for products."""
    name: str = Field(..., description="The name of the product")
    description: str = Field(..., description="A brief description of the product")
    price: float = Field(..., description="The price of the product")
    stock: int = Field(..., description="The available stock of the product")
    category_id: str = Field(..., description="ID of the child category this product belongs to")
    brand: Optional[str] = Field(None, description="The brand of the product")
    images: List[str] = Field(default_factory=list, description="List of image URLs for the product")

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
