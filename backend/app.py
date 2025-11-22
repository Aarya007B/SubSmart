from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import init_db
from backend.routers import upload, subscriptions, insights, classify

# Create FastAPI app
app = FastAPI(
    title="SubSmart API",
    description="Fintech Subscription Tracker API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(subscriptions.router)
app.include_router(insights.router)
app.include_router(classify.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("✅ Database initialized")
    print("🚀 SubSmart API is running")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to SubSmart API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/api/upload",
            "subscriptions": "/api/subscriptions",
            "insights": "/api/insights",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
