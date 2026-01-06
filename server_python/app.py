from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.admin_routes import router as admin_router
from routers.blog_routes import router as blog_router

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

app.include_router(admin_router, prefix="/api/admin")
app.include_router(blog_router, prefix="/api/blog")

