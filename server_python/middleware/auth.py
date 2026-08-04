import os
import jwt
from fastapi import Depends, Header, HTTPException
from bson import ObjectId
from configs.db import get_db

def _decode(authorization):
    if not authorization: raise HTTPException(status_code=401, detail="Missing token")
    try: return jwt.decode(authorization.removeprefix("Bearer ").strip(), os.getenv("JWT_SECRET"), algorithms=["HS256"])
    except Exception: raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: str | None = Header(default=None)):
    payload = _decode(authorization)
    try: user = await get_db()["users"].find_one({"_id": ObjectId(payload.get("sub"))})
    except Exception: user = None
    if not user: raise HTTPException(status_code=401, detail="This action requires a user account")
    return user

async def get_optional_user(authorization: str | None = Header(default=None)):
    if not authorization:
        return None
    try:
        payload = _decode(authorization)
        return await get_db()["users"].find_one({"_id": ObjectId(payload.get("sub"))})
    except Exception:
        return None

def get_current_admin(authorization: str | None = Header(default=None)):
    payload = _decode(authorization)
    if payload.get("role") != "admin" and payload.get("email") != os.getenv("ADMIN_EMAIL"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return True
