
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, reports

app = FastAPI(
    title="Diagnostic Lab Portal",
    description="API for secure laboratory report delivery",
    version="1.0.0"
)

# Allow our React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])


@app.get("/")
def home():
    return {
        "message": "Diagnostic Lab Portal Backend is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "application": "Diagnostic Lab Portal"
    }
