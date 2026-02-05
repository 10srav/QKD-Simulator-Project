"""
Redis caching layer for simulation results.
Falls back to in-memory LRU cache when Redis is unavailable.
"""
import json
import hashlib
from functools import lru_cache
from typing import Any

from app.core.config import settings

# In-memory fallback cache
_memory_cache: dict[str, str] = {}
_redis_client = None


async def get_redis():
    """Get Redis client, returning None if unavailable."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if not settings.REDIS_URL:
        return None
    try:
        import redis.asyncio as aioredis
        _redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await _redis_client.ping()
        return _redis_client
    except Exception:
        _redis_client = None
        return None


def _make_key(prefix: str, params: dict) -> str:
    """Create a deterministic cache key from parameters."""
    raw = json.dumps(params, sort_keys=True)
    digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"qkd:{prefix}:{digest}"


async def cache_get(prefix: str, params: dict) -> Any | None:
    """Retrieve a cached value."""
    key = _make_key(prefix, params)
    redis = await get_redis()
    if redis:
        val = await redis.get(key)
        if val:
            return json.loads(val)
    elif key in _memory_cache:
        return json.loads(_memory_cache[key])
    return None


async def cache_set(prefix: str, params: dict, value: Any, ttl: int = 300) -> None:
    """Store a value in cache with TTL (seconds)."""
    key = _make_key(prefix, params)
    data = json.dumps(value)
    redis = await get_redis()
    if redis:
        await redis.set(key, data, ex=ttl)
    else:
        _memory_cache[key] = data
        # Basic memory cache size limit
        if len(_memory_cache) > 500:
            oldest = next(iter(_memory_cache))
            del _memory_cache[oldest]


async def cache_invalidate(prefix: str, params: dict) -> None:
    """Remove a cached value."""
    key = _make_key(prefix, params)
    redis = await get_redis()
    if redis:
        await redis.delete(key)
    elif key in _memory_cache:
        del _memory_cache[key]
