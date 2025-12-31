from fastapi import APIRouter, Depends, File, Form, UploadFile
from middleware.auth import get_current_admin
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
)

router = APIRouter()

@router.post("/add")
async def route_add(image: UploadFile = File(...), blog: str = Form(...)):
    return await add_blog(image, blog)

@router.get("/all")
async def route_all():
    return await get_all_blogs()

@router.get("/{blogId}")
async def route_by_id(blogId: str):
    return await get_blog_by_id(blogId)


@router.get("/find/related")
async def related_blogs(
    category: str,
    exclude: str
):
    return await get_related_blogs(category, exclude)

@router.post("/delete")
async def route_delete(payload: dict, _: bool = Depends(get_current_admin)):
    return await delete_blog_by_id(payload.get("id"))

@router.post("/toggle-publish")
async def route_toggle(payload: dict, _: bool = Depends(get_current_admin)):
    return await toggle_publish(payload.get("id"))

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
async def route_generate(payload: dict, _: bool = Depends(get_current_admin)):
    return await generate_content(payload.get("prompt"))

