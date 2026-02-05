"""
SQLAlchemy ORM models for simulation history persistence.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Boolean, Integer, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SimulationHistory(Base):
    """Stores results of BB84 and E91 simulations."""
    __tablename__ = "simulation_history"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    protocol: Mapped[str] = mapped_column(String(10), index=True)  # BB84 or E91
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    # Configuration used
    config: Mapped[dict] = mapped_column(JSON)

    # Key results
    is_secure: Mapped[bool] = mapped_column(Boolean)
    eve_attack: Mapped[bool] = mapped_column(Boolean, default=False)
    eve_detected: Mapped[bool] = mapped_column(Boolean, default=False)

    # BB84-specific metrics
    qber: Mapped[float | None] = mapped_column(Float, nullable=True)
    key_efficiency: Mapped[float | None] = mapped_column(Float, nullable=True)

    # E91-specific metrics
    s_parameter: Mapped[float | None] = mapped_column(Float, nullable=True)
    key_match_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Common metrics
    sifted_key_length: Mapped[int] = mapped_column(Integer, default=0)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0)

    # Full result JSON for detailed viewing
    full_result: Mapped[dict] = mapped_column(JSON)

    # Optional label set by user
    label: Mapped[str | None] = mapped_column(String(255), nullable=True)
