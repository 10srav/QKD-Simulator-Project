"""
Health Check Endpoints
Provides system health and status information.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """
    Health check endpoint.
    Returns the current status of the API and its dependencies.
    """
    return {
        "status": "healthy",
        "service": "QKD Simulator API",
        "version": "1.0.0"
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness check - indicates if the service is ready to accept requests.
    This can include checks for database connections, external services, etc.
    """
    return {
        "ready": True,
        "checks": {
            "api": True,
            "qiskit": True  # Will be enhanced in Phase 4
        }
    }
