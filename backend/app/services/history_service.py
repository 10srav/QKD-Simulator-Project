"""
Service for persisting simulation results to the database.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session
from app.models.database import SimulationHistory


async def save_bb84_result(config: dict, result: dict) -> str:
    """Save a BB84 simulation result and return its ID."""
    record = SimulationHistory(
        protocol="BB84",
        config=config,
        is_secure=result.get("is_secure", False),
        eve_attack=config.get("eve_attack", False),
        eve_detected=result.get("eve_detected", False),
        qber=result.get("qber"),
        key_efficiency=result.get("key_efficiency"),
        sifted_key_length=len(result.get("sifted_alice_key", [])),
        execution_time_ms=result.get("execution_time_ms", 0),
        full_result=result,
    )
    async with async_session() as session:
        session.add(record)
        await session.commit()
        return record.id


async def save_e91_result(config: dict, result: dict) -> str:
    """Save an E91 simulation result and return its ID."""
    chsh = result.get("chsh_result", {})
    record = SimulationHistory(
        protocol="E91",
        config=config,
        is_secure=result.get("is_secure", False),
        eve_attack=config.get("eve_attack", False),
        eve_detected=result.get("eve_detected", False),
        s_parameter=chsh.get("s_parameter") if isinstance(chsh, dict) else None,
        key_match_rate=result.get("key_match_rate"),
        sifted_key_length=len(result.get("sifted_alice_key", [])),
        execution_time_ms=result.get("execution_time_ms", 0),
        full_result=result,
    )
    async with async_session() as session:
        session.add(record)
        await session.commit()
        return record.id
