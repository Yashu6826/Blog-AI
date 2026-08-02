import os
import jwt
from datetime import datetime
from bson import ObjectId
from configs.db import get_db
from utils.serialize import serialize_blog, serialize_comment

async def admin_login(email: str, password: str):
    if email != os.getenv("ADMIN_EMAIL") or password != os.getenv("ADMIN_PASSWORD"):
        return {"success": False, "message": "Invalid Credentials"}
    token = jwt.encode({"email": email, "role": "admin"}, os.getenv("JWT_SECRET"), algorithm="HS256")
    return {"success": True, "token": token}

def _is_admin(user):
    return bool(user and (user.get("role") == "admin" or user.get("email") == os.getenv("ADMIN_EMAIL")))

async def get_all_blogs_admin(user: dict | None = None):
    db = get_db()
    query = {} if _is_admin(user) else {"authorId": user["_id"]}
    cursor = db["blogs"].find(query).sort("createdAt", -1)
    blogs = [serialize_blog(b) for b in await cursor.to_list(length=None)]
    return {"success": True, "blogs": blogs}

async def get_all_comments(user: dict | None = None):
    db = get_db()
    pipeline = [
        {"$sort": {"createdAt": -1}},
        {"$lookup": {"from": "blogs", "localField": "blog", "foreignField": "_id", "as": "blogDoc"}},
        {"$unwind": {"path": "$blogDoc", "preserveNullAndEmptyArrays": True}}
    ]
    if user and not _is_admin(user):
        pipeline.append({"$match": {"blogDoc.authorId": user["_id"]}})
    cursor = db["comments"].aggregate(pipeline)
    comments = []
    async for c in cursor:
        comments.append(serialize_comment(c))
    return {"success": True, "comments": comments}

async def get_dashboard(user: dict | None = None):
    db = get_db()
    blog_query = {} if _is_admin(user) else {"authorId": user["_id"]}
    recent_cursor = db["blogs"].find(blog_query).sort("createdAt", -1).limit(5)
    recent = [serialize_blog(b) for b in await recent_cursor.to_list(length=None)]
    blogs = await db["blogs"].count_documents(blog_query)
    drafts_query = {**blog_query, "isPublished": False}
    drafts = await db["blogs"].count_documents(drafts_query)
    if _is_admin(user):
        comments = await db["comments"].count_documents({})
    else:
        owned_ids = [blog["_id"] for blog in await db["blogs"].find(blog_query, {"_id": 1}).to_list(length=None)]
        comments = await db["comments"].count_documents({"blog": {"$in": owned_ids}})
    dashboardData = {"blogs": blogs, "comments": comments, "drafts": drafts, "recentBlogs": recent}
    return {"success": True, "dashboardData": dashboardData}

async def _comment_access_query(comment_id: str, user: dict | None = None):
    query = {"_id": ObjectId(comment_id)}
    if _is_admin(user):
        return query
    comment = await get_db()["comments"].find_one(query)
    if not comment:
        return query
    blog = await get_db()["blogs"].find_one({"_id": comment.get("blog"), "authorId": user["_id"]})
    return query if blog else {"_id": ObjectId(comment_id), "__blocked": True}

async def delete_comment_by_id(comment_id: str, user: dict | None = None):
    db = get_db()
    result = await db["comments"].delete_one(await _comment_access_query(comment_id, user))
    if result.deleted_count == 0:
        return {"success": False, "message": "Comment not found or you do not have access."}
    return {"success": True, "message": "Comment deleted successfully"}

async def approve_comment_by_id(comment_id: str, user: dict | None = None):
    db = get_db()
    result = await db["comments"].update_one(await _comment_access_query(comment_id, user), {"$set": {"isApproved": True, "updatedAt": datetime.utcnow().isoformat()}})
    if result.matched_count == 0:
        return {"success": False, "message": "Comment not found or you do not have access."}
    return {"success": True, "message": "Comment approved successfully"}

