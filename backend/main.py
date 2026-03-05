from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routers import (
    documents_router,
    analysis_router,
    issues_router,
    comparison_router,
    tasks_router,
)

# Create uploads directory
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="SOW Document Analyzer",
    description="API for analyzing Statement of Work documents to identify vendor abuses, risks, and cost-saving opportunities",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents_router, prefix="/api/v1")
app.include_router(analysis_router, prefix="/api/v1")
app.include_router(issues_router, prefix="/api/v1")
app.include_router(comparison_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "SOW Document Analyzer API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
