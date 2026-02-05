"""
Core configuration module for QKD Simulator Backend.
Loads settings from environment variables with Pydantic.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "QKD Simulator"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # Quantum Simulation Defaults
    DEFAULT_SHOTS: int = 1024
    MAX_QUBITS: int = 20
    
    # Optional: Database URL (Phase 4)
    DATABASE_URL: str | None = None
    
    # Optional: Redis URL (Phase 4)
    REDIS_URL: str | None = None
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from JSON string or list."""
        if isinstance(v, str):
            return json.loads(v)
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
