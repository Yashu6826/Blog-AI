import os
import jwt
from datetime import datetime
from bson import ObjectId
from configs.db import get_db
from utils.serialize import serialize_blog, serialize_comment

async def admin_login(email: str, password: str):
    if email != os.getenv("ADMIN_EMAIL") or password != os.getenv("ADMIN_PASSWORD"):
        return {"success": False, "message": "Invalid Credentials"}
    token = jwt.encode({"email": email}, os.getenv("JWT_SECRET"), algorithm="HS256")
    return {"success": True, "token": token}

async def get_all_blogs_admin():
    db = get_db()
    cursor = db["blogs"].find({}).sort("createdAt", -1)
    blogs = [serialize_blog(b) for b in await cursor.to_list(length=None)]
    return {"success": True, "blogs": blogs}

async def get_all_comments():
    db = get_db()
    pipeline = [
        {"$sort": {"createdAt": -1}},
        {"$lookup": {"from": "blogs", "localField": "blog", "foreignField": "_id", "as": "blogDoc"}},
        {"$unwind": {"path": "$blogDoc", "preserveNullAndEmptyArrays": True}}
    ]
    cursor = db["comments"].aggregate(pipeline)
    comments = []
    async for c in cursor:
        comments.append(serialize_comment(c))
    return {"success": True, "comments": comments}

async def get_dashboard():
    db = get_db()
    recent_cursor = db["blogs"].find({}).sort("createdAt", -1).limit(5)
    recent = [serialize_blog(b) for b in await recent_cursor.to_list(length=None)]
    blogs = await db["blogs"].count_documents({})
    comments = await db["comments"].count_documents({})
    drafts = await db["blogs"].count_documents({"isPublished": False})
    dashboardData = {"blogs": blogs, "comments": comments, "drafts": drafts, "recentBlogs": recent}
    return {"success": True, "dashboardData": dashboardData}

async def delete_comment_by_id(comment_id: str):
    db = get_db()
    await db["comments"].delete_one({"_id": ObjectId(comment_id)})
    return {"success": True, "message": "Comment deleted successfully"}

async def approve_comment_by_id(comment_id: str):
    db = get_db()
    await db["comments"].update_one({"_id": ObjectId(comment_id)}, {"$set": {"isApproved": True, "updatedAt": datetime.utcnow().isoformat()}})
    return {"success": True, "message": "Comment approved successfully"}

