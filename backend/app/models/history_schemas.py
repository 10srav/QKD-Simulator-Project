"""
Pydantic schemas for simulation history endpoints.
"""
from typing import Optional, List
from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    """Summary item for history list."""
    id: str
    protocol: str
    created_at: str
    is_secure: bool
    eve_attack: bool
    eve_detected: bool
    qber: Optional[float] = None
    s_parameter: Optional[float] = None
    key_efficiency: Optional[float] = None
    key_match_rate: Optional[float] = None
    sifted_key_length: int
    execution_time_ms: float
    label: Optional[str] = None


class HistoryListResponse(BaseModel):
    """Paginated history list."""
    items: List[HistoryItem]
    total: int
    limit: int
    offset: int


class HistoryDetailResponse(HistoryItem):
    """Full history detail including config and result."""
    config: dict
    full_result: dict


class HistoryUpdateRequest(BaseModel):
    """Request to update history metadata."""
    label: Optional[str] = Field(None, max_length=255)


class CompareResponse(BaseModel):
    """Side-by-side comparison of two simulations."""
    simulation_1: dict
    simulation_2: dict
    deltas: dict = Field(description="Numeric differences (sim2 - sim1)")
