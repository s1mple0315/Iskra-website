from fastapi import APIRouter, HTTPException, status, Query
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

#Edit categories
@router.put("/categories/{category_id}", response_model=ParentCategory, status_code=status.HTTP_200_OK)
async def update_category(category_id: str, updated_data: CategoryBase):
    db = get_database()

    # Ensure the category exists
    category = await db.categories.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Update the category with the provided data
    update_query = updated_data.dict(exclude_unset=True)  # Only update provided fields
    result = await db.categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": update_query}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update category")

    # Fetch and return the updated category
    updated_category = await db.categories.find_one({"_id": ObjectId(category_id)})
    if category.get("parent_id") is None:
        return ParentCategory(**updated_category, id=updated_category["_id"])
    else:
        return ChildCategory(**updated_category, id=updated_category["_id"])

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
    
@router.put("/{product_id}", response_model=Product, status_code=status.HTTP_200_OK)
async def update_product(product_id: str, updated_data: ProductBase):
    db = get_database()

    # Ensure the product exists
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Validate that the new category_id points to a valid child category
    if "category_id" in updated_data.dict() and updated_data.category_id != product["category_id"]:
        category = await db.categories.find_one({"_id": ObjectId(updated_data.category_id), "parent_id": {"$ne": None}})
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category_id. Products can only belong to child categories.")

        # Remove the product from the old category's products list
        await db.categories.update_one(
            {"_id": ObjectId(product["category_id"])},
            {"$pull": {"products": ObjectId(product_id)}}
        )

        # Add the product to the new category's products list
        await db.categories.update_one(
            {"_id": ObjectId(updated_data.category_id)},
            {"$push": {"products": ObjectId(product_id)}}
        )

    # Update the product with the provided data
    update_query = updated_data.dict(exclude_unset=True)  # Only update provided fields
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_query}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update product")

    # Fetch and return the updated product
    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    return Product(**updated_product, id=updated_product["_id"])

# Search Products
@router.get("/search", response_model=List[Product])
async def search_products(
    query: str = Query(..., min_length=1),
    page: int = 1,
    limit: int = 10
):
    db = get_database()

    # Calculate pagination parameters
    skip = (page - 1) * limit

    # Perform a text search using the query
    results = db.products.find(
        {"$text": {"$search": query}},
        {"score": {"$meta": "textScore"}}
    ).skip(skip).limit(limit)

    # Sort results by relevance (textScore)
    results.sort([("score", {"$meta": "textScore"})])

    # Fetch and return the matching products
    products = []
    async for product in results:
        products.append(Product(**product, id=product["_id"]))

    return products

# Filter Products
@router.get("/filter", response_model=dict)
async def filter_products(
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    series_number: Optional[str] = None,
    memory: Optional[str] = None,
    sim_card: Optional[str] = None,
    processor_type: Optional[str] = None,
    color: Optional[str] = None,
    page: int = 1,
    limit: int = 10
):
    db = get_database()

    # Construct the query dynamically based on provided filters
    query = {}
    if brand:
        query["brand"] = brand
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if series_number:
        query["series_number"] = series_number
    if memory:
        query["memory"] = memory
    if sim_card:
        query["sim_card"] = sim_card
    if processor_type:
        query["processor_type"] = processor_type
    if color:
        query["color"] = color

    skip = (page - 1) * limit

    product_cursor = db.products.find(query).skip(skip).limit(limit)
    products = []
    async for product in product_cursor:
        products.append(Product(**product, id=product["_id"]))

    total_count = await db.products.count_documents(query)

    return {
        "products": products,
        "total_count": total_count,
        "page": page,
        "limit": limit
    }