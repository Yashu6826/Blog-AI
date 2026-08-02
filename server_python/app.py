from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.blog_routes import router as blog_router
from routers.user_routes import router as user_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return "API is Working"

app.include_router(blog_router, prefix="/api/blog")
app.include_router(user_router, prefix="/api/users")

