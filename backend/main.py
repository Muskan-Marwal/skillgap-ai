from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import init_db
from app.api.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database table initialization on startup."""
    print("Initializing database tables...")
    init_db()
    print("Database initialization complete.")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Backend API for AI-Based Skill Gap & Employment Recommendation System",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
