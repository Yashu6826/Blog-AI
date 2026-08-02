import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime
import jwt
from configs.db import get_db

try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token as google_id_token
except ImportError:
    google_requests = None
    google_id_token = None

def _hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"{base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"

def _verify_password(password, stored):
    try:
        salt_value, digest_value = stored.split("$", 1)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), base64.b64decode(salt_value), 310_000)
        return hmac.compare_digest(actual, base64.b64decode(digest_value))
    except (ValueError, TypeError):
        return False

def _public(user):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "bio": user.get("bio", ""), "role": user.get("role", "author"), "createdAt": user.get("createdAt")}

def _token(user):
    return jwt.encode({"sub": str(user["_id"]), "email": user["email"], "role": user.get("role", "author")}, os.getenv("JWT_SECRET"), algorithm="HS256")

async def register_user(name, email, password):
    name, email = (name or "").strip(), (email or "").strip().lower()
    if len(name) < 2 or "@" not in email or len(password or "") < 8:
        return {"success": False, "message": "Use a name, valid email, and a password of at least 8 characters."}
    db = get_db()
    if await db["users"].find_one({"email": email}):
        return {"success": False, "message": "An account with this email already exists."}
    user = {"name": name, "email": email, "passwordHash": _hash_password(password), "bio": "", "role": "author", "createdAt": datetime.utcnow().isoformat()}
    user["_id"] = (await db["users"].insert_one(user)).inserted_id
    return {"success": True, "token": _token(user), "user": _public(user)}

async def login_user(email, password):
    email = (email or "").strip().lower()
    user = await get_db()["users"].find_one({"email": email})
    if not user or not _verify_password(password or "", user.get("passwordHash", "")):
        return {"success": False, "message": "Incorrect email or password."}
    return {"success": True, "token": _token(user), "user": _public(user)}

async def google_login(credential):
    if not credential:
        return {"success": False, "message": "Missing Google credential."}
    if google_id_token is None or google_requests is None:
        return {"success": False, "message": "Google auth is not installed on the server."}

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        return {"success": False, "message": "GOOGLE_CLIENT_ID is not configured."}

    try:
        info = google_id_token.verify_oauth2_token(credential, google_requests.Request(), client_id)
    except ValueError:
        return {"success": False, "message": "Google sign in could not be verified."}

    email = (info.get("email") or "").strip().lower()
    if not info.get("email_verified") or "@" not in email:
        return {"success": False, "message": "Google account email is not verified."}

    db = get_db()
    user = await db["users"].find_one({"email": email})
    if user:
        await db["users"].update_one({"_id": user["_id"]}, {"$set": {"name": info.get("name") or user.get("name", "QuickBlog Author"), "updatedAt": datetime.utcnow().isoformat()}})
        user.update({"name": info.get("name") or user.get("name", "QuickBlog Author")})
    else:
        user = {
            "name": info.get("name") or "QuickBlog Author",
            "email": email,
            "passwordHash": "",
            "bio": "",
            "role": "author",
            "createdAt": datetime.utcnow().isoformat(),
            "provider": "google",
        }
        user["_id"] = (await db["users"].insert_one(user)).inserted_id
    return {"success": True, "token": _token(user), "user": _public(user)}

async def get_profile(user):
    return {"success": True, "user": _public(user)}

async def update_profile(user, name, bio):
    name = (name or "").strip()
    if len(name) < 2: return {"success": False, "message": "Please enter a display name."}
    bio = (bio or "").strip()
    await get_db()["users"].update_one({"_id": user["_id"]}, {"$set": {"name": name, "bio": bio, "updatedAt": datetime.utcnow().isoformat()}})
    user.update({"name": name, "bio": bio})
    return {"success": True, "user": _public(user)}
