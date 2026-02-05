"""
Integration tests for QKD Simulator API endpoints.
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_root_endpoint(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["message"] == "QKD Simulator API"
    assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_health_endpoint(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_api_health(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_bb84_presets(client):
    resp = await client.get("/api/v1/bb84/presets")
    assert resp.status_code == 200
    data = resp.json()
    assert "presets" in data
    assert len(data["presets"]) > 0


@pytest.mark.asyncio
async def test_bb84_simulate_basic(client):
    payload = {
        "n_qubits": 4,
        "bases": ["Z", "X"],
        "eve_attack": False,
        "shots": 100,
    }
    resp = await client.post("/api/v1/bb84/simulate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "qber" in data
    assert "is_secure" in data
    assert "sifted_alice_key" in data
    assert "sifted_bob_key" in data
    assert "circuit_json" in data
    assert data["shots_used"] == 100


@pytest.mark.asyncio
async def test_bb84_simulate_with_eve(client):
    payload = {
        "n_qubits": 4,
        "bases": ["Z", "X"],
        "eve_attack": True,
        "eve_intercept_ratio": 1.0,
        "shots": 100,
    }
    resp = await client.post("/api/v1/bb84/simulate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["eve_intercepted_indices"] is not None
    assert data["eve_bases"] is not None


@pytest.mark.asyncio
async def test_bb84_validation_error(client):
    payload = {"n_qubits": 100}  # exceeds max 20
    resp = await client.post("/api/v1/bb84/simulate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_e91_simulate_basic(client):
    payload = {
        "n_pairs": 3,
        "alice_angles": [0.0, 45.0, 90.0],
        "bob_angles": [45.0, 90.0, 135.0],
        "eve_attack": False,
        "shots": 100,
        "noise_level": 0.0,
    }
    resp = await client.post("/api/v1/e91/simulate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "chsh_result" in data
    assert "s_parameter" in data["chsh_result"]
    assert "is_secure" in data
    assert "sifted_alice_key" in data


@pytest.mark.asyncio
async def test_e91_validation_error(client):
    payload = {"n_pairs": 50}  # exceeds max 20
    resp = await client.post("/api/v1/e91/simulate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_crypto_encrypt_decrypt(client):
    encrypt_payload = {
        "plaintext": "Hello Quantum World",
        "quantum_key": [0, 1, 1, 0, 1, 0, 0, 1] * 16,  # 128 bits
        "key_size": 128,
    }
    resp = await client.post("/api/v1/crypto/encrypt", json=encrypt_payload)
    if resp.status_code == 200:
        data = resp.json()
        assert "ciphertext" in data
        assert "iv" in data

        # Now decrypt
        decrypt_payload = {
            "ciphertext": data["ciphertext"],
            "quantum_key": encrypt_payload["quantum_key"],
            "key_size": 128,
            "iv": data["iv"],
        }
        dresp = await client.post("/api/v1/crypto/decrypt", json=decrypt_payload)
        if dresp.status_code == 200:
            ddata = dresp.json()
            assert "plaintext" in ddata


@pytest.mark.asyncio
async def test_history_list_empty(client):
    resp = await client.get("/api/v1/history")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_history_detail_not_found(client):
    resp = await client.get("/api/v1/history/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_history_delete_not_found(client):
    resp = await client.delete("/api/v1/history/nonexistent-id")
    assert resp.status_code == 404
