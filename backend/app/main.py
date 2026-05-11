from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

from app.api.routes import api_router
from app.api.websocket import ws_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router) # WebSockets don't use the standard API prefix typically

@app.get("/")
def read_root():
    return {"status": "online", "message": "IIDPS-NEXUS Backend is running."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "components": ["api", "ml_engine", "prevention"]}
