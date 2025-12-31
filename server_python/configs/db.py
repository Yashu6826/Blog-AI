# configs/db.py

from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
# Your MongoDB connection string from Atlas (keep it as-is, even if it has no database name)
MONGODB_URI = os.getenv("MONGODB_URI")  # e.g. mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net

# Create the async client
client = AsyncIOMotorClient(MONGODB_URI)

# Explicitly define your app's database name
# Change "quickblog" to whatever you want (e.g., blogdb, myapp, etc.)
db = client.test
# OR: db = client["quickblog"]  # same thing

# Dependency function for FastAPI
def get_db():
    return db
