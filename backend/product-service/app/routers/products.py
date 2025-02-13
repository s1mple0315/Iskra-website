from fastapi import APIRouter, HTTPException, status, Query
from app.models import ParentCategory, ChildCategory, CategoryBase, Product, ProductBase
from app.database import get_database
from bson import ObjectId
from typing import List, Optional
from app.database import redis, db
import json
from app.database import redis

# if redis is None:
#     raise RuntimeError("❌ Redis is not initialized. Ensure `connect_redis()` is called in startup.")


router = APIRouter(prefix="/api/v1/products", tags=["Products"])

# Create Parent Category
@router.post("/categories/parent", response_model=ParentCategory, status_code=status.HTTP_201_CREATED)
async def create_parent_category(category: CategoryBase):
    db = get_database()
    new_category = category.dict()
    result = await db.categories.insert_one(new_category)
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    return ParentCategory(**created_category, id=created_category["_id"])

@router.post("/categories/child", response_model=ChildCategory, status_code=status.HTTP_201_CREATED)
async def create_child_category(category: CategoryBase):
    db = get_database()

    if not category.parent_id:
        raise HTTPException(status_code=400, detail="Parent ID is required for child categories")

    # Ensure parent category exists
    parent = await db.categories.find_one({"_id": ObjectId(category.parent_id)})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")

    # ✅ Insert new child category
    new_category = category.dict()
    new_category["parent_id"] = ObjectId(category.parent_id)  # Store as ObjectId
    result = await db.categories.insert_one(new_category)

    # ✅ Convert inserted `_id` to string
    child_id = str(result.inserted_id)

    # ✅ Update parent category's `subcategories` field
    await db.categories.update_one(
        {"_id": ObjectId(category.parent_id)},
        {"$push": {"subcategories": child_id}}
    )

    return {"id": child_id, "name": category.name, "parent_id": category.parent_id, "products": []}


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

@router.get("/categories/parents", response_model=List[ParentCategory])
async def get_all_parent_categories():
    db = get_database()
    parent_categories = []

    cursor = db.categories.find({"parent_id": None})
    async for category in cursor:
        category["_id"] = str(category["_id"])  # ✅ Convert _id to string (fixes issue)
        category["subcategories"] = [str(sub) for sub in category.get("subcategories", [])]
        parent_categories.append(ParentCategory(**category))

    return parent_categories

@router.get("/categories/{parent_id}/subcategories", response_model=List[ChildCategory])
async def get_subcategories_of_parent(parent_id: str):
    db = get_database()

    # Ensure parent category exists
    parent = await db.categories.find_one({"_id": ObjectId(parent_id)})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")

    # ✅ Fetch subcategories using stored subcategory IDs
    subcategories = []
    for sub_id in parent.get("subcategories", []):
        subcategory = await db.categories.find_one({"_id": ObjectId(sub_id)})
        if subcategory:
            subcategories.append({
                "_id": str(subcategory["_id"]),  # ✅ Ensure `_id` is included correctly
                "id": str(subcategory["_id"]),  # ✅ Include `id` for aliasing
                "name": subcategory["name"],
                "parent_id": str(subcategory["parent_id"]),
                "products": [str(p) for p in subcategory.get("products", [])]
            })

    return subcategories

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductBase):
    db = get_database()

    # ✅ Ensure category exists
    category = await db.categories.find_one({"_id": ObjectId(product.category_id)})
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category_id. Category not found.")

    # ✅ Ensure category is a child category
    if category.get("parent_id") is None:
        raise HTTPException(status_code=400, detail="Products can only be created under child categories.")

    # ✅ Insert product into MongoDB
    new_product = product.dict()
    result = await db.products.insert_one(new_product)

    # ✅ Fetch created product and ensure `_id` is string
    created_product = await db.products.find_one({"_id": result.inserted_id})
    created_product["_id"] = str(created_product["_id"])
    created_product["category_id"] = str(created_product["category_id"])

    # ✅ Add product's ID to the category's `products` list
    await db.categories.update_one(
        {"_id": ObjectId(product.category_id)},
        {"$push": {"products": str(result.inserted_id)}}  # Convert ID to string
    )

    return Product(**created_product)


# Get Products in a Subcategory with Pagination
@router.get("/categories/{subcategory_id}/products", response_model=dict)
async def get_products_in_subcategory(subcategory_id: str, page: int = 1, limit: int = 10):
    db = get_database()

    # ✅ Ensure subcategory exists
    subcategory = await db.categories.find_one({"_id": ObjectId(subcategory_id)})
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")

    # ✅ Check if subcategory contains products
    product_ids = subcategory.get("products", [])

    if not product_ids:
        return {"products": [], "total_count": 0, "page": page, "limit": limit}

    # ✅ Fetch products and properly convert `_id` to string
    product_cursor = db.products.find({"_id": {"$in": [ObjectId(pid) for pid in product_ids]}}).skip((page - 1) * limit).limit(limit)

    products = []
    async for product in product_cursor:
        product["_id"] = str(product["_id"])  # ✅ Convert `_id` to string
        product["category_id"] = str(product["category_id"])  # ✅ Convert category_id to string
        products.append(Product(**product))

    total_count = len(product_ids)

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
    query: str,
    page: int = 1,
    limit: int = 10
):
    db = get_database()

    # ✅ Calculate pagination
    skip = (page - 1) * limit

    # ✅ Perform a text search using MongoDB
    product_cursor = db.products.find(
        {"$text": {"$search": query}},
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).skip(skip).limit(limit)

    # ✅ Convert `_id` to string before returning
    products = []
    async for product in product_cursor:
        product["_id"] = str(product["_id"])  # ✅ Fix: Ensure `_id` is a string
        product["category_id"] = str(product["category_id"])  # ✅ Convert category_id to string
        products.append(Product(**product))

    return products

# Filter Products
@router.get("/filter", response_model=dict)
async def filter_products(
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "price",
    order: Optional[str] = "asc",
    page: int = 1,
    limit: int = 10
):
    """Retrieve filtered products with sorting and Redis caching"""
    query = {}

    if brand:
        query["brand"] = brand
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price

    skip = (page - 1) * limit

    # Define sorting order
    sort_order = 1 if order == "asc" else -1
    valid_sort_fields = {"price", "stock", "name"}
    if sort_by not in valid_sort_fields:
        raise HTTPException(status_code=400, detail=f"Invalid sort field. Choose from {valid_sort_fields}")

    # Generate cache key
    cache_key = f"products:{json.dumps(query, sort_keys=True)}:sort:{sort_by}:{order}:page:{page}:limit:{limit}"

    # Check Redis cache
    cached_data = await redis.get(cache_key)
    if cached_data:
        print("✅ Returning cached sorted results")
        return json.loads(cached_data)

    # Fetch from MongoDB
    product_cursor = db.products.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
    products = [Product(**product, id=str(product["_id"])) async for product in product_cursor]
    total_count = await db.products.count_documents(query)

    result = {"products": products, "total_count": total_count, "page": page, "limit": limit}

    # Store in Redis cache for 60 seconds
    await redis.setex(cache_key, 60, json.dumps(result, default=str))

    return result

@router.get("/autocomplete", response_model=List[str])
async def autocomplete_products(query: str = Query(..., min_length=1, max_length=50)):
    """Returns autocomplete suggestions for product names using MongoDB text search."""
    
    # Check Redis cache first
    cache_key = f"autocomplete:{query}"
    cached_data = await redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    # MongoDB Text Search
    cursor = db.products.find(
        {"$text": {"$search": query}}, 
        {"score": {"$meta": "textScore"}}
    ).sort([("score", {"$meta": "textScore"})]).limit(5)

    suggestions = [product["name"] async for product in cursor]

    # Store in Redis for 30 seconds
    await redis.setex(cache_key, 30, json.dumps(suggestions))

    return suggestions

# Delete a Category
@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str):
    db = get_database()

    # Check if the category exists
    category = await db.categories.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # If it's a parent category, delete all subcategories and their products
    if category.get("parent_id") is None:  # Parent category
        # Recursive function to delete subcategories and their products
        async def delete_subcategories(cat_id: str):
            subcategories_cursor = db.categories.find({"parent_id": ObjectId(cat_id)})
            subcategories = []
            async for subcategory in subcategories_cursor:
                subcategories.append(subcategory["_id"])
                await delete_subcategories(str(subcategory["_id"]))  # Recursively delete subcategories

            # Delete all products associated with these subcategories
            if subcategories:
                await db.products.delete_many({"category_id": {"$in": [ObjectId(cid) for cid in subcategories]}})

            # Delete the subcategories themselves
            await db.categories.delete_many({"parent_id": ObjectId(cat_id)})

        # Start recursive deletion
        await delete_subcategories(category_id)

    # Delete the category itself
    result = await db.categories.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete category")

    # Remove the category from the parent's subcategories list (if applicable)
    if category.get("parent_id"):
        await db.categories.update_one(
            {"_id": ObjectId(category["parent_id"])},
            {"$pull": {"subcategories": ObjectId(category_id)}}
        )

    return {"message": "Category deleted successfully"}


# Delete a Product
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    db = get_database()

    # Check if the product exists
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Remove the product from the category's products list
    category_id = product["category_id"]
    await db.categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$pull": {"products": ObjectId(product_id)}}
    )

    # Delete the product itself
    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete product")

    return {"message": "Product deleted successfully"}