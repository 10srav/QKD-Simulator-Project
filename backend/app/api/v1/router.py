"""
API v1 Router Configuration
Aggregates all endpoint routers for the v1 API.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import bb84, e91, health, crypto, history

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(bb84.router, prefix="/bb84", tags=["BB84 Protocol"])
api_router.include_router(e91.router, prefix="/e91", tags=["E91 Protocol"])
api_router.include_router(crypto.router, prefix="/crypto", tags=["Encryption"])
api_router.include_router(history.router, prefix="/history", tags=["History"])

