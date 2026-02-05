"""
Simulation History API Endpoints
CRUD operations for persisted simulation results.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.core.database import get_db
from app.models.database import SimulationHistory
from app.models.history_schemas import (
    HistoryListResponse,
    HistoryDetailResponse,
    HistoryItem,
    CompareResponse,
    HistoryUpdateRequest,
)

router = APIRouter()


@router.get("", response_model=HistoryListResponse)
async def list_history(
    protocol: Optional[str] = Query(None, description="Filter by protocol (BB84 or E91)"),
    eve_attack: Optional[bool] = Query(None, description="Filter by Eve attack"),
    is_secure: Optional[bool] = Query(None, description="Filter by security status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List simulation history with optional filters."""
    query = select(SimulationHistory).order_by(desc(SimulationHistory.created_at))

    if protocol:
        query = query.where(SimulationHistory.protocol == protocol.upper())
    if eve_attack is not None:
        query = query.where(SimulationHistory.eve_attack == eve_attack)
    if is_secure is not None:
        query = query.where(SimulationHistory.is_secure == is_secure)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Apply pagination
    query = query.offset(offset).limit(limit)
    results = (await db.execute(query)).scalars().all()

    items = [
        HistoryItem(
            id=r.id,
            protocol=r.protocol,
            created_at=r.created_at.isoformat(),
            is_secure=r.is_secure,
            eve_attack=r.eve_attack,
            eve_detected=r.eve_detected,
            qber=r.qber,
            s_parameter=r.s_parameter,
            key_efficiency=r.key_efficiency,
            key_match_rate=r.key_match_rate,
            sifted_key_length=r.sifted_key_length,
            execution_time_ms=r.execution_time_ms,
            label=r.label,
        )
        for r in results
    ]

    return HistoryListResponse(items=items, total=total, limit=limit, offset=offset)


@router.get("/{simulation_id}", response_model=HistoryDetailResponse)
async def get_history_detail(
    simulation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get full details of a specific simulation."""
    result = await db.get(SimulationHistory, simulation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Simulation not found")

    return HistoryDetailResponse(
        id=result.id,
        protocol=result.protocol,
        created_at=result.created_at.isoformat(),
        config=result.config,
        is_secure=result.is_secure,
        eve_attack=result.eve_attack,
        eve_detected=result.eve_detected,
        qber=result.qber,
        s_parameter=result.s_parameter,
        key_efficiency=result.key_efficiency,
        key_match_rate=result.key_match_rate,
        sifted_key_length=result.sifted_key_length,
        execution_time_ms=result.execution_time_ms,
        label=result.label,
        full_result=result.full_result,
    )


@router.patch("/{simulation_id}")
async def update_history(
    simulation_id: str,
    update: HistoryUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update a simulation label."""
    result = await db.get(SimulationHistory, simulation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Simulation not found")

    if update.label is not None:
        result.label = update.label

    await db.commit()
    return {"status": "updated", "id": simulation_id}


@router.delete("/{simulation_id}")
async def delete_history(
    simulation_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a simulation from history."""
    result = await db.get(SimulationHistory, simulation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Simulation not found")

    await db.delete(result)
    await db.commit()
    return {"status": "deleted", "id": simulation_id}


@router.get("/compare/{id1}/{id2}", response_model=CompareResponse)
async def compare_simulations(
    id1: str,
    id2: str,
    db: AsyncSession = Depends(get_db),
):
    """Compare two simulations side-by-side."""
    sim1 = await db.get(SimulationHistory, id1)
    sim2 = await db.get(SimulationHistory, id2)

    if not sim1 or not sim2:
        raise HTTPException(status_code=404, detail="One or both simulations not found")

    def _metrics(sim: SimulationHistory) -> dict:
        return {
            "id": sim.id,
            "protocol": sim.protocol,
            "created_at": sim.created_at.isoformat(),
            "config": sim.config,
            "is_secure": sim.is_secure,
            "eve_attack": sim.eve_attack,
            "eve_detected": sim.eve_detected,
            "qber": sim.qber,
            "s_parameter": sim.s_parameter,
            "key_efficiency": sim.key_efficiency,
            "key_match_rate": sim.key_match_rate,
            "sifted_key_length": sim.sifted_key_length,
            "execution_time_ms": sim.execution_time_ms,
            "label": sim.label,
        }

    # Compute deltas for shared numeric metrics
    deltas = {}
    for field in ["qber", "s_parameter", "key_efficiency", "key_match_rate",
                   "sifted_key_length", "execution_time_ms"]:
        v1 = getattr(sim1, field)
        v2 = getattr(sim2, field)
        if v1 is not None and v2 is not None:
            deltas[field] = round(v2 - v1, 4)

    return CompareResponse(
        simulation_1=_metrics(sim1),
        simulation_2=_metrics(sim2),
        deltas=deltas,
    )
