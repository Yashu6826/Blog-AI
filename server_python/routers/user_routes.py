from fastapi import APIRouter, Depends
from controllers.user_controller import get_profile, google_login, login_user, register_user, update_profile
from middleware.auth import get_current_user
router = APIRouter()
@router.post("/register")
async def register(payload: dict): return await register_user(payload.get("name"), payload.get("email"), payload.get("password"))
@router.post("/login")
async def login(payload: dict): return await login_user(payload.get("email"), payload.get("password"))
@router.post("/google")
async def google(payload: dict): return await google_login(payload.get("credential"))
@router.get("/me")
async def me(user: dict = Depends(get_current_user)): return await get_profile(user)
@router.patch("/me")
async def update_me(payload: dict, user: dict = Depends(get_current_user)): return await update_profile(user, payload.get("name"), payload.get("bio"))
