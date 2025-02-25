import os
import uuid
from PIL import Image
import io
from fastapi import APIRouter, File, HTTPException, UploadFile, status, Query
from app.models import ParentCategory, ChildCategory, CategoryBase, Product, ProductBase
from app.database import get_database
from bson import ObjectId
from typing import List, Optional
from app.database import redis, db
import json
from app.database import redis


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


@router.post(
    "/categories/parent",
    response_model=ParentCategory,
    status_code=status.HTTP_201_CREATED,
)
async def create_parent_category(category: CategoryBase):
    db = get_database()
    new_category = category.dict()
    result = await db.categories.insert_one(new_category)
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    return ParentCategory(**created_category, id=created_category["_id"])


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

    parent = await db.categories.find_one({"_id": ObjectId(category.parent_id)})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")

    new_category = category.dict()
    new_category["parent_id"] = ObjectId(category.parent_id)
    result = await db.categories.insert_one(new_category)

    child_id = str(result.inserted_id)

    await db.categories.update_one(
        {"_id": ObjectId(category.parent_id)}, {"$push": {"subcategories": child_id}}
    )

    return {
        "id": child_id,
        "name": category.name,
        "parent_id": category.parent_id,
        "products": [],
    }


@router.post("/upload-images/{product_id}", status_code=status.HTTP_201_CREATED)
async def upload_images(product_id: str, files: list[UploadFile] = File(...)):
    db = get_database()

    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product_dir = os.path.join(UPLOAD_DIR, product_id)
    os.makedirs(product_dir, exist_ok=True)

    image_paths = []
    for file in files:
        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(
                status_code=400, detail=f"Invalid file type: {file.filename}"
            )

        optimized_file = compress_and_resize_image(file.file)

        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(product_dir, unique_filename)

        with open(file_path, "wb") as buffer:
            buffer.write(optimized_file.read())

        relative_path = f"/static/images/products/{product_id}/{unique_filename}"
        image_paths.append(relative_path)

    await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$push": {"images": {"$each": image_paths}}}
    )

    return {"message": "Images uploaded successfully", "image_paths": image_paths}


@router.post(
    "/categories/{category_id}/upload-image", status_code=status.HTTP_201_CREATED
)
async def upload_category_image(category_id: str, file: UploadFile = File(...)):
    db = get_database()

    category = await db.categories.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(
            status_code=400, detail=f"Invalid file type: {file.filename}"
        )

    optimized_file = compress_and_resize_image(file.file)

    category_dir = os.path.join(UPLOAD_DIR, category_id)
    os.makedirs(category_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(category_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(optimized_file.read())

    image_url = f"/static/images/products/{category_id}/{unique_filename}"

    await db.categories.update_one(
        {"_id": ObjectId(category_id)}, {"$set": {"image": image_url}}
    )

    return {"message": "Category image uploaded successfully", "image_url": image_url}


@router.put(
    "/categories/{category_id}",
    response_model=ParentCategory,
    status_code=status.HTTP_200_OK,
)
async def update_category(category_id: str, updated_data: CategoryBase):
    db = get_database()

    category = await db.categories.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_query = updated_data.dict(exclude_unset=True)
    result = await db.categories.update_one(
        {"_id": ObjectId(category_id)}, {"$set": update_query}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update category")

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
        category["_id"] = str(category["_id"])

        subcategories_data = []
        for sub_id in category.get("subcategories", []):
            subcategory = await db.categories.find_one({"_id": ObjectId(sub_id)})
            if subcategory:
                subcategories_data.append(
                    {"id": str(subcategory["_id"]), "name": subcategory["name"]}
                )

        category["subcategories"] = subcategories_data
        parent_categories.append(ParentCategory(**category))

    return parent_categories


@router.get("/categories/parents/{category_id}", response_model=ParentCategory)
async def get_parent_category(category_id: str):
    db = get_database()

    category = await db.categories.find_one({"_id": ObjectId(category_id)})

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    subcategories = []
    for subcategory_id in category.get("subcategories", []):
        subcategory = await db.categories.find_one({"_id": ObjectId(subcategory_id)})
        if subcategory:
            subcategories.append(
                {"id": str(subcategory["_id"]), "name": subcategory["name"]}
            )

    category["_id"] = str(category["_id"])
    category["subcategories"] = subcategories

    return ParentCategory(**category)


@router.get("/categories/{parent_id}/subcategories", response_model=List[ChildCategory])
async def get_subcategories_of_parent(parent_id: str):
    db = get_database()

    parent = await db.categories.find_one({"_id": ObjectId(parent_id)})
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")

    subcategories = []
    for sub_id in parent.get("subcategories", []):
        subcategory = await db.categories.find_one({"_id": ObjectId(sub_id)})
        if subcategory:
            subcategories.append(
                {
                    "_id": str(subcategory["_id"]),
                    "id": str(subcategory["_id"]),
                    "name": subcategory["name"],
                    "parent_id": str(subcategory["parent_id"]),
                    "products": [str(p) for p in subcategory.get("products", [])],
                }
            )

    return subcategories


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductBase):
    db = get_database()

    category = await db.categories.find_one({"_id": ObjectId(product.category_id)})
    if not category:
        raise HTTPException(
            status_code=400, detail="Invalid category_id. Category not found."
        )

    if category.get("parent_id") is None:
        raise HTTPException(
            status_code=400,
            detail="Products can only be created under child categories.",
        )

    new_product = product.dict()
    result = await db.products.insert_one(new_product)

    created_product = await db.products.find_one({"_id": result.inserted_id})
    created_product["_id"] = str(created_product["_id"])
    created_product["category_id"] = str(created_product["category_id"])

    await db.categories.update_one(
        {"_id": ObjectId(product.category_id)},
        {"$push": {"products": str(result.inserted_id)}},
    )

    return Product(**created_product)


@router.get("/categories/{subcategory_id}/products", response_model=dict)
async def get_products_in_subcategory(
    subcategory_id: str, page: int = 1, limit: int = 10
):
    db = get_database()

    subcategory = await db.categories.find_one({"_id": ObjectId(subcategory_id)})
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")

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
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product["_id"] = str(product["_id"])
    return Product(**product)


@router.put("/{product_id}", response_model=Product, status_code=status.HTTP_200_OK)
async def update_product(product_id: str, updated_data: ProductBase):
    db = get_database()

    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if (
        "category_id" in updated_data.dict()
        and updated_data.category_id != product["category_id"]
    ):
        category = await db.categories.find_one(
            {"_id": ObjectId(updated_data.category_id), "parent_id": {"$ne": None}}
        )
        if not category:
            raise HTTPException(
                status_code=400,
                detail="Invalid category_id. Products can only belong to child categories.",
            )

        await db.categories.update_one(
            {"_id": ObjectId(product["category_id"])},
            {"$pull": {"products": ObjectId(product_id)}},
        )

        await db.categories.update_one(
            {"_id": ObjectId(updated_data.category_id)},
            {"$push": {"products": ObjectId(product_id)}},
        )

    update_query = updated_data.dict(exclude_unset=True)
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": update_query}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update product")

    updated_product = await db.products.find_one({"_id": ObjectId(product_id)})
    return Product(**updated_product, id=updated_product["_id"])


@router.get("/search", response_model=List[Product])
async def search_products(query: str, page: int = 1, limit: int = 10):
    db = get_database()

    skip = (page - 1) * limit

    product_cursor = (
        db.products.find(
            {"$text": {"$search": query}}, {"score": {"$meta": "textScore"}}
        )
        .sort([("score", {"$meta": "textScore"})])
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
    sort_by: Optional[str] = "price",
    order: Optional[str] = "asc",
    page: int = 1,
    limit: int = 10,
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
    """Returns autocomplete suggestions for product names using MongoDB text search."""

    cache_key = f"autocomplete:{query}"
    cached_data = await redis.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    cursor = (
        db.products.find(
            {"$text": {"$search": query}}, {"score": {"$meta": "textScore"}}
        )
        .sort([("score", {"$meta": "textScore"})])
        .limit(5)
    )

    suggestions = [product["name"] async for product in cursor]

    await redis.setex(cache_key, 30, json.dumps(suggestions))

    return suggestions


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str):
    db = get_database()

    category = await db.categories.find_one({"_id": ObjectId(category_id)})
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

    result = await db.categories.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete category")

    if category.get("parent_id"):
        await db.categories.update_one(
            {"_id": ObjectId(category["parent_id"])},
            {"$pull": {"subcategories": ObjectId(category_id)}},
        )

    return {"message": "Category deleted successfully"}


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    db = get_database()

    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    category_id = product["category_id"]
    await db.categories.update_one(
        {"_id": ObjectId(category_id)}, {"$pull": {"products": ObjectId(product_id)}}
    )

    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete product")

    return {"message": "Product deleted successfully"}
