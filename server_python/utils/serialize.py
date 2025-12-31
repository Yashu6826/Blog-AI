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
    return {
        "_id": oid_str(doc.get("_id")),
        "title": doc.get("title"),
        "subTitle": doc.get("subTitle"),
        "description": doc.get("description"),
        "category": doc.get("category"),
        "image": doc.get("image"),
        "isPublished": doc.get("isPublished"),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt"),
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
