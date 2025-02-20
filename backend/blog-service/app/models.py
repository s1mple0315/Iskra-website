from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# Helper function to convert ObjectId to string
def object_id_to_str(oid):
    return str(oid) if isinstance(oid, ObjectId) else oid

class Comment(BaseModel):
    """Schema for comments on a blog post."""
    comment_id: str = Field(alias="_id")  # Use alias to map `_id` from MongoDB
    user_id: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: object_id_to_str}  # Ensure ObjectId is converted to string
        populate_by_name = True  # Allow alias mapping

class BlogBase(BaseModel):
    """Base schema for creating a blog post."""
    title: str
    content: str
    author_id: str
    category: str
    tags: List[str] = []
    status: str = "draft"  # Default to "draft"
    featured_image: Optional[str] = None

class Blog(BlogBase):
    """Schema for a blog post stored in the database."""
    id: str = Field(alias="_id")  # Use alias to map `_id` from MongoDB
    slug: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reading_time: int
    views: int = 0
    likes: int = 0
    comments: List[Comment] = []

    class Config:
        json_encoders = {ObjectId: object_id_to_str}  # Ensure ObjectId is converted to string
        populate_by_name = True  # Allow alias mapping