import os
import jwt
from fastapi import Depends, Header, HTTPException

def get_current_admin(authorization: str | None = Header(default=None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        jwt.decode(authorization, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        return True
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

