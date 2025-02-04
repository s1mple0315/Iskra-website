from fastapi import APIRouter, HTTPException, status
from app.models import ParentCategory, ChildCategory, CategoryBase, Product, ProductBase
from app.database import get_database
from bson import ObjectId
from typing import List, Optional

router = APIRouter(prefix="/api/v1/products", tags=["Products"])

# Create Parent Category
@router.post("/categories/parent", response_model=ParentCategory, status_code=status.HTTP_201_CREATED)
async def create_parent_category(category: CategoryBase):
    db = get_database()
    new_category = category.dict()
    result = await db.categories.insert_one(new_category)
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    return ParentCategory(**created_category, id=created_category["_id"])

# Create Child Category
@router.post("/categories/child", response_model=ChildCategory, status_code=status.HTTP_201_CREATED)
async def create_child_category(category: CategoryBase):
    db = get_database()

    # Ensure the parent category exists
    if not category.parent_id:
        raise HTTPException(status_code=400, detail="Parent ID is required for child categories")

    parent = await db.categories.find_one({"_id": ObjectId(category.parent_id)})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")

    new_category = category.dict()
    result = await db.categories.insert_one(new_category)
    created_category = await db.categories.find_one({"_id": result.inserted_id})

    # Add the child category to the parent's subcategories list
    await db.categories.update_one(
        {"_id": ObjectId(category.parent_id)},
        {"$push": {"subcategories": result.inserted_id}}
    )

    return ChildCategory(**created_category, id=created_category["_id"])

# Get All Parent Categories
@router.get("/categories/parents", response_model=List[ParentCategory])
async def get_all_parent_categories():
    db = get_database()
    parent_categories = []
    cursor = db.categories.find({"parent_id": None})  # Fetch only parent categories
    async for category in cursor:
        parent_categories.append(ParentCategory(**category, id=category["_id"]))
    return parent_categories

# Get Subcategories of a Parent Category
@router.get("/categories/{parent_id}/subcategories", response_model=List[ChildCategory])
async def get_subcategories_of_parent(parent_id: str):
    db = get_database()

    # Ensure the parent category exists
    parent = await db.categories.find_one({"_id": ObjectId(parent_id), "parent_id": None})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")

    subcategories = []
    cursor = db.categories.find({"parent_id": ObjectId(parent_id)})
    async for category in cursor:
        subcategories.append(ChildCategory(**category, id=category["_id"]))
    return subcategories

# Create Product
@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductBase):
    db = get_database()

    # Ensure the category_id points to a valid child category
    category = await db.categories.find_one({"_id": ObjectId(product.category_id), "parent_id": {"$ne": None}})
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id. Products can only be created under child categories.")

    new_product = product.dict()
    result = await db.products.insert_one(new_product)
    created_product = await db.products.find_one({"_id": result.inserted_id})

    # Add the product to the child category's products list
    await db.categories.update_one(
        {"_id": ObjectId(product.category_id)},
        {"$push": {"products": result.inserted_id}}
    )

    return Product(**created_product, id=created_product["_id"])

# Get Products in a Subcategory with Pagination
@router.get("/categories/{subcategory_id}/products", response_model=dict)
async def get_products_in_subcategory(subcategory_id: str, page: int = 1, limit: int = 10):
    db = get_database()

    # Ensure the subcategory exists
    subcategory = await db.categories.find_one({"_id": ObjectId(subcategory_id), "parent_id": {"$ne": None}})
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")

    # Calculate pagination parameters
    skip = (page - 1) * limit

    # Fetch products and total count
    product_cursor = db.products.find({"category_id": ObjectId(subcategory_id)}).skip(skip).limit(limit)
    products = []
    async for product in product_cursor:
        products.append(Product(**product, id=product["_id"]))

    total_count = await db.products.count_documents({"category_id": ObjectId(subcategory_id)})

    return {
        "products": products,
        "total_count": total_count,
        "page": page,
        "limit": limit
    }