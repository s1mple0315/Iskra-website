import os
import uuid

import bson
from PIL import Image
import io
from fastapi import APIRouter, File, HTTPException, UploadFile, status, Query
from app.models import ParentCategory, ChildCategory, CategoryBase, Product, ProductBase
from app.database import get_database, redis, db
from bson import ObjectId
from typing import List, Optional
import json
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/products", tags=["Products"])
UPLOAD_DIR = "static/images/products/"


def compress_and_resize_image(file, max_size=(800, 800), quality=85):
    img = Image.open(file)
    if img.mode in ("P", "RGBA", "LA"):
        img = img.convert("RGB")
    if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=quality)
    output.seek(0)
    return output


async def fetch_category_with_subcategories(category_id: str, db):
    logger.info(f"Fetching category: {category_id}")
    try:
        oid = ObjectId(category_id)
    except bson.errors.InvalidId:
        raise HTTPException(
            status_code=400, detail=f"Invalid category_id format: {category_id}"
        )
    category = await db.categories.find_one({"_id": oid})
    if not category:
        logger.info(f"Category {category_id} not found")
        return None
    category_data = {
        "_id": str(category["_id"]),
        "name": category["name"],
        "parent_id": str(category["parent_id"]) if category.get("parent_id") else None,
        "image": category.get("image"),
        "subcategories": category.get("subcategories", []),
        "products": [str(p) for p in category.get("products", [])],
    }
    if "subcategories" in category:
        subcategories = []
        for sub in category["subcategories"]:
            if (
                isinstance(sub, dict)
                and "_id" in sub
                and re.match(r"^[0-9a-fA-F]{24}$", sub["_id"])
            ):
                sub_cat = await fetch_category_with_subcategories(str(sub["_id"]), db)
                if sub_cat:
                    if sub_cat["parent_id"]:
                        parent = await db.categories.find_one(
                            {"_id": ObjectId(sub_cat["parent_id"])}
                        )
                        logger.info(
                            f"Checking parent {sub_cat['parent_id']} for subcategory {sub_cat['_id']}"
                        )
                        if parent and not parent.get("parent_id"):
                            logger.info(
                                f"Enforcing empty products for subcategory {sub_cat['_id']}"
                            )
                            sub_cat["products"] = []
                    subcategories.append(ChildCategory(**sub_cat, id=sub_cat["_id"]))
            else:
                logger.warning(f"Skipping invalid subcategory entry: {sub}")
        category_data["subcategories"] = subcategories
    logger.info(f"Completed fetching category: {category_id}")
    return category_data


@router.post(
    "/categories/parent",
    response_model=ParentCategory,
    status_code=status.HTTP_201_CREATED,
)
async def create_parent_category(category: CategoryBase):
    db = get_database()
    if category.parent_id:
        raise HTTPException(
            status_code=400, detail="Parent categories cannot have a parent_id"
        )
    new_category = category.dict(exclude_unset=True)
    result = await db.categories.insert_one(new_category)
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    processed_category = {
        "_id": str(created_category["_id"]),
        "name": created_category["name"],
        "parent_id": None,
        "image": created_category.get("image"),
        "subcategories": created_category.get("subcategories", []),
    }
    return ParentCategory(**processed_category)


@router.post(
    "/categories/child",
    response_model=ChildCategory,
    status_code=status.HTTP_201_CREATED,
)
async def create_child_category(category: CategoryBase):
    db = get_database()
    if not category.parent_id:
        raise HTTPException(
            status_code=400, detail="Parent ID is required for child categories"
        )
    try:
        parent = await db.categories.find_one({"_id": ObjectId(category.parent_id)})
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid parent_id format")
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")
    new_category = category.dict(exclude_unset=True)
    new_category["parent_id"] = ObjectId(category.parent_id)
    result = await db.categories.insert_one(new_category)
    child_id = str(result.inserted_id)
    await db.categories.update_one(
        {"_id": ObjectId(category.parent_id)},
        {"$push": {"subcategories": {"_id": child_id, "name": category.name}}},
    )
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    processed_category = {
        "_id": str(created_category["_id"]),
        "name": created_category["name"],
        "parent_id": (
            str(created_category["parent_id"])
            if created_category.get("parent_id")
            else None
        ),
        "image": created_category.get("image"),
        "subcategories": created_category.get("subcategories", []),
        "products": [str(p) for p in created_category.get("products", [])],
    }
    return ChildCategory(**processed_category)


@router.get(
    "/categories/parents-with-subcategories", response_model=List[ParentCategory]
)
async def get_parents_with_subcategories():
    db = get_database()
    parent_categories = []
    cursor = db.categories.find({"parent_id": None})
    async for category in cursor:
        print(f"Processing parent category: {category}")
        processed_category = await fetch_category_with_subcategories(
            str(category["_id"]), db
        )
        if processed_category:
            parent_categories.append(
                ParentCategory(**processed_category, id=processed_category["_id"])
            )
    return parent_categories


@router.get(
    "/categories/parents-with-subcategories", response_model=List[ParentCategory]
)
async def get_parents_with_subcategories():
    db = get_database()
    parent_categories = []
    cursor = db.categories.find({"parent_id": None})
    async for category in cursor:
        print(f"Processing parent category: {category}")  
        processed_category = {
            "_id": str(category["_id"]),
            "name": category["name"],
            "parent_id": None,
            "image": category.get("image"),
            "subcategories": [],
        }
        if "subcategories" in category:
            subcategories = []
            for sub in category["subcategories"]:
                if (
                    isinstance(sub, dict)
                    and "_id" in sub
                    and re.match(r"^[0-9a-fA-F]{24}$", sub["_id"])
                ):
                    print(f"Processing subcategory: {sub}") 
                    sub_cat = await db.categories.find_one(
                        {"_id": ObjectId(sub["_id"])}
                    )
                    if sub_cat:
                        processed_sub = {
                            "_id": str(sub_cat["_id"]),
                            "name": sub_cat["name"],
                            "parent_id": (
                                str(sub_cat["parent_id"])
                                if sub_cat.get("parent_id")
                                else None
                            ),
                            "image": sub_cat.get("image"),
                            "subcategories": [],  # No recursion
                            "products": [],  # Enforce no products for direct subcategories
                        }
                        subcategories.append(ChildCategory(**processed_sub))
                else:
                    print(f"Skipping invalid subcategory: {sub}")  # Debug log
            processed_category["subcategories"] = subcategories
        parent_categories.append(ParentCategory(**processed_category))
    return parent_categories


@router.get("/categories/parents", response_model=List[ParentCategory])
async def get_all_parent_categories():
    logger.info("Entering get_all_parent_categories")
    db = get_database()
    parent_categories = []
    cursor = db.categories.find({"parent_id": None})
    async for category in cursor:
        logger.info(f"Processing parent category: {category}")
        processed_category = {
            "id": str(category["_id"]),
            "name": category["name"],
            "parent_id": None,
            "image": category.get("image"),
            "subcategories": [],
        }
        parent_categories.append(ParentCategory(**processed_category))
    return parent_categories


@router.get("/categories/parents/{category_id}", response_model=ParentCategory)
async def get_parent_category(category_id: str):
    db = get_database()
    try:
        oid = ObjectId(category_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid category_id format")
    category = await fetch_category_with_subcategories(category_id, db)
    if not category or category.get("parent_id") is not None:
        raise HTTPException(status_code=404, detail="Parent category not found")
    return ParentCategory(**category, id=category["_id"])


@router.get("/categories/{parent_id}/subcategories", response_model=List[ChildCategory])
async def get_subcategories_of_parent(parent_id: str):
    db = get_database()
    try:
        oid = ObjectId(parent_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid parent_id format")
    parent = await db.categories.find_one({"_id": oid})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")
    subcategories = []
    for sub in parent.get("subcategories", []):
        if (
            isinstance(sub, dict)
            and "_id" in sub
            and re.match(r"^[0-9a-fA-F]{24}$", sub["_id"])
        ):
            print(f"Processing subcategory: {sub}")  # Debug log
            sub_cat = await fetch_category_with_subcategories(str(sub["_id"]), db)
            if sub_cat:
                # Enforce no products for direct subcategories of a parent
                sub_cat["products"] = []
                subcategories.append(ChildCategory(**sub_cat, id=sub_cat["_id"]))
        else:
            print(f"Skipping invalid subcategory: {sub}")  # Debug log
    return subcategories


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductBase):
    db = get_database()
    try:
        oid = ObjectId(product.category_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid category_id format")
    category = await db.categories.find_one({"_id": oid})
    if not category:
        raise HTTPException(
            status_code=400, detail="Invalid category_id. Category not found."
        )
    # Check if the category is a direct child of a parent (no grandparent)
    if category.get("parent_id"):
        parent = await db.categories.find_one({"_id": ObjectId(category["parent_id"])})
        if parent and not parent.get("parent_id"):
            raise HTTPException(
                status_code=400,
                detail="Products are not allowed for subcategories of parent categories.",
            )
    new_product = product.dict()
    result = await db.products.insert_one(new_product)
    created_product = await db.products.find_one({"_id": result.inserted_id})
    created_product["_id"] = str(created_product["_id"])
    created_product["category_id"] = str(created_product["category_id"])
    await db.categories.update_one(
        {"_id": oid}, {"$push": {"products": str(result.inserted_id)}}
    )
    return Product(**created_product)


@router.get("/categories/{subcategory_id}/products", response_model=dict)
async def get_products_in_subcategory(
    subcategory_id: str, page: int = 1, limit: int = 10
):
    db = get_database()
    try:
        oid = ObjectId(subcategory_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid subcategory_id format")
    subcategory = await db.categories.find_one({"_id": oid})
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    # Check if the subcategory is a direct child of a parent
    if subcategory.get("parent_id"):
        parent = await db.categories.find_one(
            {"_id": ObjectId(subcategory["parent_id"])}
        )
        if parent and not parent.get("parent_id"):
            return {"products": [], "total_count": 0, "page": page, "limit": limit}
    product_ids = subcategory.get("products", [])
    if not product_ids:
        return {"products": [], "total_count": 0, "page": page, "limit": limit}
    product_cursor = (
        db.products.find({"_id": {"$in": [ObjectId(pid) for pid in product_ids]}})
        .skip((page - 1) * limit)
        .limit(limit)
    )
    products = []
    async for product in product_cursor:
        product["_id"] = str(product["_id"])
        product["category_id"] = str(product["category_id"])
        products.append(Product(**product))
    total_count = len(product_ids)
    return {
        "products": products,
        "total_count": total_count,
        "page": page,
        "limit": limit,
    }


@router.get("/products/{product_id}", response_model=Product)
async def get_product_by_id(product_id: str):
    db = get_database()
    try:
        oid = ObjectId(product_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product_id format")
    product = await db.products.find_one({"_id": oid})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product["_id"] = str(product["_id"])
    return Product(**product)


@router.put("/{product_id}", response_model=Product, status_code=status.HTTP_200_OK)
async def update_product(product_id: str, updated_data: ProductBase):
    db = get_database()
    try:
        oid = ObjectId(product_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product_id format")
    product = await db.products.find_one({"_id": oid})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if (
        "category_id" in updated_data.dict()
        and updated_data.category_id != product["category_id"]
    ):
        try:
            category_oid = ObjectId(updated_data.category_id)
        except bson.errors.InvalidId:
            raise HTTPException(status_code=400, detail="Invalid category_id format")
        category = await db.categories.find_one({"_id": category_oid})
        if not category:
            raise HTTPException(
                status_code=400, detail="Invalid category_id. Category not found."
            )
        # Check if the new category is a direct child of a parent
        if category.get("parent_id"):
            parent = await db.categories.find_one(
                {"_id": ObjectId(category["parent_id"])}
            )
            if parent and not parent.get("parent_id"):
                raise HTTPException(
                    status_code=400,
                    detail="Products cannot be assigned to subcategories of parent categories.",
                )
        await db.categories.update_one(
            {"_id": ObjectId(product["category_id"])}, {"$pull": {"products": oid}}
        )
        await db.categories.update_one(
            {"_id": category_oid}, {"$push": {"products": oid}}
        )
    update_query = updated_data.dict(exclude_unset=True)
    result = await db.products.update_one({"_id": oid}, {"$set": update_query})
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update product")
    updated_product = await db.products.find_one({"_id": oid})
    return Product(**updated_product, id=str(updated_product["_id"]))


@router.get("/search", response_model=List[Product])
async def search_products(query: str, page: int = 1, limit: int = 10):
    db = get_database()
    skip = (page - 1) * limit
    product_cursor = (
        db.products.find({"name": {"$regex": query, "$options": "i"}})
        .skip(skip)
        .limit(limit)
    )
    products = []
    async for product in product_cursor:
        product["_id"] = str(product["_id"])
        product["category_id"] = str(product["category_id"])
        products.append(Product(**product))
    return products


@router.get("/filter", response_model=dict)
async def filter_products(
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    series: Optional[str] = None,
    memory: Optional[str] = None,
    sim_card: Optional[str] = None,
    processor_type: Optional[str] = None,
    color: Optional[str] = None,
    sort_by: Optional[str] = "price",
    order: Optional[str] = "asc",
    page: int = 1,
    limit: int = 10,
):
    query = {}
    if brand:
        query["brand"] = brand
    if series:
        query["series"] = series
    if memory:
        query["memory"] = memory
    if sim_card:
        query["sim_card"] = sim_card
    if processor_type:
        query["processor_type"] = processor_type
    if color:
        query["color"] = color
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    skip = (page - 1) * limit
    sort_order = 1 if order == "asc" else -1
    valid_sort_fields = {"price", "stock", "name"}
    if sort_by not in valid_sort_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort field. Choose from {valid_sort_fields}",
        )
    cache_key = f"products:{json.dumps(query, sort_keys=True)}:sort:{sort_by}:{order}:page:{page}:limit:{limit}"
    cached_data = await redis.get(cache_key)
    if cached_data:
        print("✅ Returning cached sorted results")
        return json.loads(cached_data)
    product_cursor = (
        db.products.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
    )
    products = [
        Product(**product, id=str(product["_id"])) async for product in product_cursor
    ]
    total_count = await db.products.count_documents(query)
    result = {
        "products": products,
        "total_count": total_count,
        "page": page,
        "limit": limit,
    }
    await redis.setex(cache_key, 60, json.dumps(result, default=str))
    return result


@router.get("/autocomplete", response_model=List[str])
async def autocomplete_products(query: str = Query(..., min_length=1, max_length=50)):
    cache_key = f"autocomplete:{query.lower()}"
    cached_data = await redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)
    cursor = db.products.find({"name": {"$regex": f"^{query}", "$options": "i"}}).limit(
        5
    )
    suggestions = [product["name"] async for product in cursor]
    await redis.setex(cache_key, 30, json.dumps(suggestions))
    return suggestions


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str):
    db = get_database()
    try:
        oid = ObjectId(category_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid category_id format")
    category = await db.categories.find_one({"_id": oid})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.get("parent_id") is None:

        async def delete_subcategories(cat_id: str):
            subcategories_cursor = db.categories.find({"parent_id": ObjectId(cat_id)})
            subcategories = []
            async for subcategory in subcategories_cursor:
                subcategories.append(subcategory["_id"])
                await delete_subcategories(str(subcategory["_id"]))
            if subcategories:
                await db.products.delete_many(
                    {"category_id": {"$in": [ObjectId(cid) for cid in subcategories]}}
                )
            await db.categories.delete_many({"parent_id": ObjectId(cat_id)})

        await delete_subcategories(category_id)
    result = await db.categories.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete category")
    if category.get("parent_id"):
        await db.categories.update_one(
            {"_id": ObjectId(category["parent_id"])}, {"$pull": {"subcategories": oid}}
        )
    return {"message": "Category deleted successfully"}


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    db = get_database()
    try:
        oid = ObjectId(product_id)
    except bson.errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid product_id format")
    product = await db.products.find_one({"_id": oid})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    category_id = product["category_id"]
    await db.categories.update_one(
        {"_id": ObjectId(category_id)}, {"$pull": {"products": oid}}
    )
    result = await db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete product")
    return {"message": "Product deleted successfully"}
