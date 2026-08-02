from bson import ObjectId
from datetime import datetime
from typing import Any

def oid_str(v):
    return str(v) if isinstance(v, ObjectId) else v

def serialize_any(obj: Any):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: serialize_any(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [serialize_any(v) for v in obj]
    return obj

def serialize_blog(doc):
    if not doc:
        return None
    read_time = doc.get("readTime")
    word_count = doc.get("wordCount")
    return {
        "_id": oid_str(doc.get("_id")),
        "id": oid_str(doc.get("_id")),
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "subTitle": doc.get("subTitle"),
        "excerpt": doc.get("excerpt") or doc.get("subTitle"),
        "description": doc.get("description"),
        "contentHtml": doc.get("contentHtml") or doc.get("description"),
        "category": doc.get("category"),
        "tags": doc.get("tags") or [],
        "highlights": doc.get("highlights") or [],
        "level": doc.get("level") or "Notes",
        "wordCount": word_count or 0,
        "readTime": read_time or 0,
        "readTimeLabel": f"{read_time or 0} min read",
        "reads": doc.get("reads") or 0,
        "readsLabel": f"{doc.get('reads') or 0} reads",
        "image": doc.get("image"),
        "coverImage": doc.get("coverImage") or doc.get("image"),
        "isPublished": doc.get("isPublished"),
        "status": doc.get("status") or ("published" if doc.get("isPublished") else "draft"),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
        "publishedAt": doc.get("publishedAt"),
        "author": {
            "id": oid_str(doc.get("authorId")),
            "name": doc.get("authorName") or "QuickBlog Team",
            "email": doc.get("authorEmail") or "",
            "bio": doc.get("authorBio") or "",
        },
    }

def serialize_comment(doc):
    if not doc:
        return None
    out = {
        "_id": oid_str(doc.get("_id")),
        "blog": oid_str(doc.get("blog")),
        "name": doc.get("name"),
        "content": doc.get("content"),
        "isApproved": doc.get("isApproved"),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
    }
    if doc.get("blogDoc"):
        out["blogDoc"] = serialize_blog(doc.get("blogDoc"))
    return out
