from fastapi import APIRouter, Depends
from middleware.auth import get_current_admin
from controllers.admin_controller import (
    admin_login,
    get_all_blogs_admin,
    get_all_comments,
    delete_comment_by_id,
    approve_comment_by_id,
    get_dashboard,
)

router = APIRouter()

@router.post("/login")
async def route_login(payload: dict):
    return await admin_login(payload.get("email"), payload.get("password"))

@router.get("/comments")
async def route_comments(_: bool = Depends(get_current_admin)):
    return await get_all_comments()

@router.get("/blogs")
async def route_blogs(_: bool = Depends(get_current_admin)):
    return await get_all_blogs_admin()

@router.post("/delete-comment")
async def route_delete_comment(payload: dict, _: bool = Depends(get_current_admin)):
    return await delete_comment_by_id(payload.get("id"))

@router.post("/approve-comment")
async def route_approve_comment(payload: dict, _: bool = Depends(get_current_admin)):
    return await approve_comment_by_id(payload.get("id"))

@router.get("/dashboard")
async def route_dashboard(_: bool = Depends(get_current_admin)):
    return await get_dashboard()

