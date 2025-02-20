from PIL import Image
from datetime import datetime
import os
from fastapi import APIRouter, File, HTTPException, UploadFile, status, Depends
from app.models import Blog, BlogBase, Comment
from app.database import get_database
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/api/v1/blogs", tags=["Blogs"])
STATIC_DIR = "static/images/blogs"
os.makedirs(STATIC_DIR, exist_ok=True)

# Helper function to estimate reading time
def estimate_reading_time(content: str) -> int:
    word_count = len(content.split())
    reading_speed = 200  # Words per minute
    return max(1, word_count // reading_speed)

# Create a Blog Post (Existing)
@router.post("/", response_model=Blog, status_code=status.HTTP_201_CREATED)
async def create_blog(blog: BlogBase):
    db = get_database()

    # Generate slug from title
    slug = blog.title.lower().replace(" ", "-")

    # Estimate reading time
    reading_time = estimate_reading_time(blog.content)

    # Insert the blog into the database
    new_blog = blog.dict()
    new_blog["slug"] = slug
    new_blog["created_at"] = datetime.utcnow()
    new_blog["reading_time"] = reading_time
    result = await db.blogs.insert_one(new_blog)

    # Fetch the created blog
    created_blog = await db.blogs.find_one({"_id": result.inserted_id})

    # Convert _id to string before passing to the Pydantic model
    created_blog["_id"] = str(created_blog["_id"])

    return Blog(**created_blog)

@router.post("/{blog_id}/upload-image", status_code=status.HTTP_201_CREATED)
async def upload_blog_image(blog_id: str, file: UploadFile = File(...)):
    db = get_database()

    # Ensure the blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")

    # Save the file locally
    file_extension = file.filename.split(".")[-1]
    file_name = f"{blog_id}.{file_extension}"  # Use blog_id as the filename
    file_path = os.path.join(STATIC_DIR, file_name)

    # Optimize and resize the image
    try:
        img = Image.open(file.file)
        if img.mode == "RGBA":
            img = img.convert("RGB")  # Convert to RGB for JPEG compatibility
        img.thumbnail((1200, 800))  # Resize to max dimensions of 1200x800
        img.save(file_path, format="JPEG", quality=85)  # Save as optimized JPEG
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

    # Update the blog's featured_image field
    featured_image_url = f"/static/images/blogs/{file_name}"
    await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": {"featured_image": featured_image_url}}
    )

    return {"message": "Image uploaded successfully", "image_url": featured_image_url}


# Get All Blog Posts (Existing)
@router.get("/", response_model=List[Blog])
async def get_all_blogs():
    db = get_database()
    blogs = []
    cursor = db.blogs.find({})
    async for blog in cursor:
        blog["_id"] = str(blog["_id"])
        blogs.append(Blog(**blog))
    return blogs

# Get a Single Blog Post by id (Existing)
@router.get("/{blog_id}", response_model=Blog)
async def get_blog_by_id(blog_id: str):
    db = get_database()

    # Ensure the blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Convert _id to string before passing to the Pydantic model
    blog["_id"] = str(blog["_id"])

    return Blog(**blog)

# Add a Comment to a Blog Post (Existing)
@router.post("/{blog_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_comment(blog_id: str, comment: Comment):
    db = get_database()

    # Ensure the blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Add the comment to the blog's comments array
    comment_dict = comment.dict()
    comment_dict["created_at"] = datetime.utcnow()
    await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$push": {"comments": comment_dict}}
    )

    return {"message": "Comment added successfully"}

# ----------------- NEW ENDPOINTS -----------------

# Edit a Blog Post
@router.put("/{blog_id}", response_model=Blog, status_code=status.HTTP_200_OK)
async def update_blog(blog_id: str, updated_data: BlogBase):
    db = get_database()

    # Ensure the blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Update the blog with the provided data
    update_query = updated_data.dict(exclude_unset=True)  # Only update provided fields
    if "content" in update_query:
        update_query["reading_time"] = estimate_reading_time(update_query["content"])  # Recalculate reading time

    result = await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": update_query}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update blog")

    # Fetch and return the updated blog
    updated_blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    updated_blog["_id"] = str(updated_blog["_id"])
    return Blog(**updated_blog)

# Delete a Blog Post
@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(blog_id: str):
    db = get_database()

    # Check if the blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Delete the blog
    result = await db.blogs.delete_one({"_id": ObjectId(blog_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Failed to delete blog")

    return {"message": "Blog deleted successfully"}

# Edit a Comment
@router.put("/{blog_id}/comments/{comment_id}", status_code=status.HTTP_200_OK)
async def update_comment(blog_id: str, comment_id: str, updated_content: str):
    db = get_database()

    # Ensure the blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Find and update the specific comment
    updated = await db.blogs.update_one(
        {"_id": ObjectId(blog_id), "comments.comment_id": comment_id},
        {"$set": {"comments.$.content": updated_content, "comments.$.updated_at": datetime.utcnow()}}
    )

    if updated.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found or failed to update")

    return {"message": "Comment updated successfully"}

# Delete a Comment
@router.delete("/{blog_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(blog_id: str, comment_id: str):
    db = get_database()

    # Ensure the blog exists
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # Remove the specific comment
    result = await db.blogs.update_one(
        {"_id": ObjectId(blog_id)},
        {"$pull": {"comments": {"comment_id": comment_id}}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found or failed to delete")

    return {"message": "Comment deleted successfully"}