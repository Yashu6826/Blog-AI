import json
import re
from datetime import datetime
from fastapi import UploadFile, Query
from configs.db import get_db
from configs.imagekit import imagekit
from configs.openrouter import generate_content as ai_generate
from utils.serialize import serialize_blog, serialize_comment
from bson import ObjectId
from bson.errors import InvalidId

def _now():
    return datetime.utcnow().isoformat()

def _plain_text(html: str):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html or "")).strip()

def _word_count(html: str):
    text = _plain_text(html)
    return len(text.split()) if text else 0

def _read_time(words: int):
    return max(1, round(words / 200)) if words else 0

def _excerpt(html: str, fallback: str = "", limit: int = 220):
    text = fallback.strip() or _plain_text(html)
    return text if len(text) <= limit else f"{text[:limit].rsplit(' ', 1)[0]}..."

def _normalize_tags(tags):
    if not tags:
        return []
    if isinstance(tags, str):
        tags = [part.strip() for part in tags.split(",")]
    clean = []
    for tag in tags:
        value = str(tag or "").strip().lower()
        if not value:
            continue
        value = value if value.startswith("#") else f"#{value}"
        if value not in clean:
            clean.append(value)
    return clean[:8]

def _slugify(title: str):
    slug = re.sub(r"[^a-z0-9]+", "-", (title or "").lower()).strip("-")
    return slug or "untitled"

async def _unique_slug(db, title: str):
    base = _slugify(title)
    slug = base
    counter = 2
    while await db["blogs"].find_one({"slug": slug}):
        slug = f"{base}-{counter}"
        counter += 1
    return slug

async def _upload_cover(image: UploadFile | None):
    if not image:
        return None
    content = await image.read()
    if not content:
        return None
    upload = imagekit.upload_file(file=content, file_name=image.filename, options={"folder": "/blogs"})
    return imagekit.url({
        "path": upload.get("filePath"),
        "transformation": [
            {"quality": "auto"},
            {"format": "webp"},
            {"width": "1280"}
        ]
    })

async def add_blog(payload, author: dict, image: UploadFile | None = None):
    if isinstance(payload, str):
        payload = json.loads(payload)
    payload = payload or {}

    title = (payload.get("title") or "").strip()
    subTitle = (payload.get("subTitle") or payload.get("excerpt") or "").strip()
    description = (payload.get("description") or payload.get("contentHtml") or "").strip()
    category = (payload.get("category") or "General").strip()
    isPublished = bool(payload.get("isPublished"))
    tags = _normalize_tags(payload.get("tags"))
    highlights = [str(item).strip() for item in payload.get("highlights", []) if str(item).strip()][:4]
    level = (payload.get("level") or "Notes").strip()

    if not title or not description or not category:
        return {"success": False, "message": "A title, body, and category are required."}

    db = get_db()
    words = _word_count(description)
    cover_image = payload.get("image") or await _upload_cover(image)
    now = _now()
    doc = {
        "title": title,
        "subTitle": subTitle,
        "excerpt": _excerpt(description, subTitle),
        "description": description,
        "contentHtml": description,
        "category": category,
        "tags": tags,
        "highlights": highlights,
        "level": level,
        "slug": await _unique_slug(db, title),
        "wordCount": words,
        "readTime": _read_time(words),
        "reads": int(payload.get("reads") or 0),
        "image": cover_image,
        "coverImage": cover_image,
        "isPublished": bool(isPublished),
        "status": "published" if isPublished else "draft",
        "createdAt": now,
        "updatedAt": now,
        "publishedAt": now if isPublished else None,
        "authorId": author["_id"],
        "authorName": author.get("name", "QuickBlog Team"),
        "authorEmail": author.get("email", ""),
        "authorBio": author.get("bio", ""),
    }
    result = await db["blogs"].insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"success": True, "message": "Blog added successfully", "blog": serialize_blog(doc)}

async def get_all_blogs(search: str = "", category: str = "", tag: str = "", sort: str = "recent"):
    db = get_db()
    query = {"isPublished": True}
    if category and category.lower() != "all":
        query["category"] = category
    if tag and tag.lower() != "all":
        query["tags"] = tag if tag.startswith("#") else f"#{tag}"
    if search:
        pattern = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [{"title": pattern}, {"subTitle": pattern}, {"excerpt": pattern}, {"category": pattern}, {"tags": pattern}]

    sort_field = "createdAt"
    sort_direction = -1
    if sort == "popular":
        sort_field = "reads"
    elif sort == "longest":
        sort_field = "readTime"

    cursor = db["blogs"].find(query).sort(sort_field, sort_direction)

    blogs = []
    async for blog in cursor:
        blog["_id"] = str(blog["_id"])  # 🔥 REQUIRED
        blogs.append(serialize_blog(blog))

    return {
        "success": True,
        "blogs": blogs
    }

async def get_my_blogs(author: dict):
    cursor = get_db()["blogs"].find({"authorId": author["_id"]}).sort("createdAt", -1)
    return {"success": True, "blogs": [serialize_blog(blog) for blog in await cursor.to_list(length=None)]}


async def get_blog_by_id(blog_id: str, user: dict | None = None):
    db = get_db()
    try:
        query = {"_id": ObjectId(blog_id)} if ObjectId.is_valid(blog_id) else {"slug": blog_id}
        doc = await db["blogs"].find_one(query)
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}

    if not doc:
        return {"success": False, "message": "Blog not found"}

    is_owner = bool(
        user
        and (
            user.get("role") == "admin"
            or user.get("_id") == doc.get("authorId")
        )
    )
    if not doc.get("isPublished") and not is_owner:
        return {"success": False, "message": "Blog not found"}

    if doc.get("isPublished"):
        await db["blogs"].update_one({"_id": doc["_id"]}, {"$inc": {"reads": 1}, "$set": {"updatedAt": doc.get("updatedAt") or _now()}})
        doc["reads"] = int(doc.get("reads") or 0) + 1

    return {"success": True, "blog": serialize_blog(doc)}

async def get_related_blogs(
    category: str = Query(...),
    exclude: str = Query(...),
    
):
    db = get_db()
    try:
        exclude_id = ObjectId(exclude)
        query = {
            "category": category,
            "isPublished": True,
            "_id": {"$ne": exclude_id}
        }
    except InvalidId:
        # If exclude ID is invalid, just fetch by category without exclusion
        query = {
            "category": category,
            "isPublished": True
        }

    cursor = db["blogs"].find(query).sort("createdAt", -1).limit(4)

    blogs = []
    async for blog in cursor:
        blogs.append(serialize_blog(blog))

    return {
        "success": True,
        "blogs": blogs,
        "posts": blogs,
    }

async def delete_blog_by_id(blog_id: str, user: dict | None = None):
    db = get_db()
    try:
        query = {"_id": ObjectId(blog_id)}
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}
    if user and user.get("role") != "admin":
        query["authorId"] = user["_id"]
    result = await db["blogs"].delete_one(query)
    if result.deleted_count == 0:
        return {"success": False, "message": "Blog not found or you do not have access."}
    await db["comments"].delete_many({"blog": ObjectId(blog_id)})
    return {"success": True, "message": "Blog deleted successfully"}

async def toggle_publish(blog_id: str, user: dict | None = None):
    db = get_db()
    try:
        query = {"_id": ObjectId(blog_id)}
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}
    if user and user.get("role") != "admin":
        query["authorId"] = user["_id"]
    doc = await db["blogs"].find_one(query)

    if not doc:
        return {"success": False, "message": "Blog not found"}
    new_val = not bool(doc.get("isPublished"))
    now = _now()
    await db["blogs"].update_one(
        {"_id": ObjectId(blog_id)},
        {"$set": {
            "isPublished": new_val,
            "status": "published" if new_val else "draft",
            "publishedAt": now if new_val else None,
            "updatedAt": now,
        }}
    )
    updated = await db["blogs"].find_one({"_id": ObjectId(blog_id)})
    return {
        "success": True,
        "message": "Blog published successfully" if new_val else "Blog moved back to drafts",
        "blog": serialize_blog(updated),
    }

async def add_comment(blog: str, name: str, content: str):
    db = get_db()
    try:
        blog_oid = ObjectId(blog)
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}

    doc = {
        "blog": blog_oid,
        "name": name,
        "content": content,
        "isApproved": False,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    await db["comments"].insert_one(doc)
    return {"success": True, "message": "Comment added for review"}

async def get_blog_comments(blog_id: str):
    db = get_db()
    try:
        cursor = db["comments"].find({"blog": ObjectId(blog_id)}).sort("createdAt", -1)
    except InvalidId:
        return {"success": False, "message": "Invalid blog ID format"}
    
    comments = [serialize_comment(c) for c in await cursor.to_list(length=None)]
    return {"success": True, "comments": comments}

async def generate_content(prompt: str):
    if not prompt or not prompt.strip():
        return {"success": False, "message": "A blog topic is required."}
    try:
        content = await ai_generate(f"{prompt}. Generate a well-structured blog post in Markdown. Return only the article content; do not add an introduction about the task.")
        return {"success": True, "content": content}
    except RuntimeError as error:
        return {"success": False, "message": str(error)}

async def suggest_description(title: str):
    title = (title or "").strip()
    if not title:
        return {"success": False, "message": "Choose or write a title first."}
    prompt = (
        "Write a substantial blog description for the title below.\n"
        "Make it 90 to 130 words, in 2 compact paragraphs.\n"
        "It should explain the problem, the angle of the article, and what the reader will learn.\n"
        "Keep it specific and technical when the title is technical.\n"
        "Return only the description text. Do not use markdown, bullets, labels, or quotes.\n\n"
        f"Title: {title}"
    )
    try:
        description = await ai_generate(prompt)
        description = description.replace("**", "").strip().strip('"')
        description = re.sub(r"^(subtitle|description|summary)\s*:\s*", "", description, flags=re.IGNORECASE).strip()
        description = re.sub(r"\n{3,}", "\n\n", description).strip().strip('"')
        return {"success": True, "title": title, "description": description}
    except RuntimeError as error:
        return {"success": False, "message": str(error)}

async def get_topics():
    prompt = "Give exactly 5 unique engineering blog topics across Systems, Frontend, AI, Infra, Career, Product, and Databases. Return one topic per line in exactly this format: Title - Category. Return no numbering, bullets, markdown, or other text."
    try:
        topics_text = await ai_generate(prompt)
    except RuntimeError as error:
        return {"success": False, "message": str(error)}
    lines = [l for l in topics_text.split("\n") if l.strip()]
    parsed = []
    for topic in lines:
        parts = topic.lstrip("-*0123456789. ").split(" - ", 1)
        title = parts[0].replace("**", "").strip().strip('"')
        category = parts[1].replace("*", "").strip() if len(parts) > 1 else None
        if title and category:
            parsed.append({"title": title, "category": category})
    return {"success": True, "topics": parsed}
