from fastapi import APIRouter, Depends, Request
from middleware.auth import get_current_user
from controllers.blog_controller import (
    add_blog,
    get_all_blogs,
    get_blog_by_id,
    delete_blog_by_id,
    toggle_publish,
    add_comment,
    get_blog_comments,
    get_topics,
    get_related_blogs,
    generate_content,
    suggest_description,
    get_my_blogs,
)

router = APIRouter()

@router.post("/add")
async def route_add(request: Request, user: dict = Depends(get_current_user)):
    content_type = request.headers.get("content-type", "")
    payload = {}
    image = None
    if "application/json" in content_type:
        payload = await request.json()
    elif "multipart/form-data" in content_type:
        form = await request.form()
        payload = form.get("blog")
        image = form.get("image")
    return await add_blog(payload, user, image)

@router.get("/all")
async def route_all(search: str = "", category: str = "", tag: str = "", sort: str = "recent"):
    return await get_all_blogs(search, category, tag, sort)

@router.get("/mine")
async def route_mine(user: dict = Depends(get_current_user)):
    return await get_my_blogs(user)

@router.get("/related")
async def route_related(category: str, exclude: str):
    return await get_related_blogs(category, exclude)

@router.get("/find/related")
async def related_blogs(
    category: str,
    exclude: str
):
    return await get_related_blogs(category, exclude)

@router.get("/{blogId}")
async def route_by_id(blogId: str):
    return await get_blog_by_id(blogId)

@router.post("/delete")
async def route_delete(payload: dict, user: dict = Depends(get_current_user)):
    return await delete_blog_by_id(payload.get("id"), user)

@router.post("/toggle-publish")
async def route_toggle(payload: dict, user: dict = Depends(get_current_user)):
    return await toggle_publish(payload.get("id"), user)

@router.post("/add-comment")
async def route_add_comment(payload: dict):
    return await add_comment(payload.get("blog"), payload.get("name"), payload.get("content"))

@router.post("/comments")
async def route_comments(payload: dict):
    return await get_blog_comments(payload.get("blogId"))

@router.post("/give-topics")
async def route_topics():
    return await get_topics()

@router.post("/generate")
async def route_generate(payload: dict, _: dict = Depends(get_current_user)):
    return await generate_content(payload.get("prompt"))

@router.post("/suggest-description")
async def route_suggest_description(payload: dict, _: dict = Depends(get_current_user)):
    return await suggest_description(payload.get("title"))

