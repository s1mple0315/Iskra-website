from bson import ObjectId
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from pydantic import BaseModel, Field
from typing import List, Optional

# Custom ObjectId class for Pydantic compatibility
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler) -> core_schema.CoreSchema:
        return core_schema.union_schema(
            [
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema(
                    [
                        core_schema.str_schema(),
                        core_schema.no_info_plain_validator_function(cls.validate),
                    ]
                ),
            ]
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema)
        json_schema.update(type="string", example="64c1a2b3f8b5e9a7b0c1d2e3")
        return json_schema


# Category Models
class CategoryBase(BaseModel):
    name: str = Field(..., description="The name of the category")
    parent_id: Optional[PyObjectId] = Field(None, description="ID of the parent category (only for subcategories)")


class ParentCategory(CategoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    subcategories: List[PyObjectId] = Field(default_factory=list, description="List of subcategory IDs")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


class ChildCategory(CategoryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    products: List[PyObjectId] = Field(default_factory=list, description="List of product IDs")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}


# Product Models
class ProductBase(BaseModel):
    name: str = Field(..., description="The name of the product")
    description: str = Field(..., description="A brief description of the product")
    price: float = Field(..., description="The price of the product")
    stock: int = Field(..., description="The available stock of the product")
    category_id: PyObjectId = Field(..., description="ID of the child category this product belongs to")
    brand: Optional[str] = Field(None, description="The brand of the product")
    series_number: Optional[str] = Field(None, description="The series number of the product")
    memory: Optional[str] = Field(None, description="The memory capacity of the product (e.g., 8GB, 16GB)")
    sim_card: Optional[str] = Field(None, description="The SIM card type of the product (e.g., Single SIM, Dual SIM)")
    processor_type: Optional[str] = Field(None, description="The processor type of the product (e.g., Intel Core i7, Snapdragon 8 Gen 2)")
    color: Optional[str] = Field(None, description="The color of the product (e.g., Black, Silver)")


class Product(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}