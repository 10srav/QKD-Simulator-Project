"""
E91 Protocol API Endpoints
Implements Quantum Key Distribution using the E91 (Ekert) protocol
with Bell state entanglement and CHSH inequality verification.
"""
from fastapi import APIRouter, HTTPException
import time

from app.models.schemas import (
    E91SimulationRequest,
    E91SimulationResult,
    CHSHResult,
)
from app.protocols.e91.entanglement import EntanglementGenerator
from app.protocols.e91.chsh_validator import CHSHValidator
from app.protocols.e91.reverse_gates import ReverseGateHandler
from app.services.history_service import save_e91_result

router = APIRouter()


@router.post("/simulate", response_model=E91SimulationResult)
async def simulate_e91(request: E91SimulationRequest):
    """
    Run an E91 Quantum Key Distribution simulation.
    
    The E91 protocol uses quantum entanglement to establish secure keys:
    1. Generate EPR pairs (Bell states) shared between Alice and Bob
    2. Each party measures their qubit at various angles
    3. CHSH inequality is tested to verify quantum correlations
    4. If S > 2, no eavesdropper present (quantum violation detected)
    5. Keys extracted from correlated measurements
    
    **Security Threshold**: S-parameter > 2 indicates secure quantum channel.
    S ≤ 2 suggests classical eavesdropping or decoherence.
    
    Returns:
    - CHSH analysis with S-parameter
    - Measurement correlations
    - Sifted keys for Alice and Bob
    - Security assessment
    """
    start_time = time.time()
    
    try:
        # Generate entangled pairs
        entanglement_gen = EntanglementGenerator(
            n_pairs=request.n_pairs,
            noise_level=request.noise_level
        )
        
        circuit, circuit_json = entanglement_gen.create_bell_pairs()
        
        # Execute measurements at various angles
        alice_angles = request.alice_angles
        bob_angles = request.bob_angles
        
        correlations = entanglement_gen.measure_correlations(
            circuit=circuit,
            alice_angles=alice_angles,
            bob_angles=bob_angles,
            shots=request.shots
        )
        
        # Perform CHSH inequality test
        chsh_validator = CHSHValidator()
        chsh_result = chsh_validator.calculate_chsh(correlations)
        
        # Check for Eve and apply reverse gates if detected
        is_secure = chsh_result["s_parameter"] > 2.0
        eve_detected = not is_secure
        
        if eve_detected and request.eve_attack:
            # Apply reverse gates mechanism
            reverse_handler = ReverseGateHandler()
            reverse_handler.apply_reverse_gates(
                correlations=correlations,
                s_parameter=chsh_result["s_parameter"]
            )
        
        # Extract sifted keys from matching angle measurements
        sifted_alice, sifted_bob = entanglement_gen.extract_keys(
            correlations=correlations,
            alice_angles=alice_angles,
            bob_angles=bob_angles
        )
        
        # Calculate key match rate
        if len(sifted_alice) > 0:
            matches = sum(1 for a, b in zip(sifted_alice, sifted_bob) if a == b)
            key_match_rate = (matches / len(sifted_alice)) * 100
        else:
            key_match_rate = 0.0
        
        execution_time = (time.time() - start_time) * 1000

        result = E91SimulationResult(
            circuit_json=circuit_json,
            circuit_depth=circuit.depth() if hasattr(circuit, 'depth') else 0,
            alice_angles_used=alice_angles,
            bob_angles_used=bob_angles,
            correlations=correlations,
            chsh_result=CHSHResult(
                s_parameter=chsh_result["s_parameter"],
                classical_bound=2.0,
                quantum_max=2.828,
                violates_classical=chsh_result["s_parameter"] > 2.0,
                expectation_values=chsh_result["expectation_values"]
            ),
            is_secure=is_secure,
            eve_detected=eve_detected,
            sifted_alice_key=sifted_alice,
            sifted_bob_key=sifted_bob,
            key_match_rate=key_match_rate,
            execution_time_ms=execution_time,
            shots_per_combination=request.shots
        )

        # Persist to history
        try:
            await save_e91_result(
                config=request.model_dump(mode="json"),
                result=result.model_dump(mode="json"),
            )
        except Exception:
            pass  # Don't fail the simulation if history save fails

        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"E91 simulation failed: {str(e)}"
        )


@router.get("/analyze/{simulation_id}")
async def analyze_e91(simulation_id: str):
    """
    Get detailed CHSH analysis for a completed E91 simulation.
    Retrieves full result from history database.
    """
    from fastapi import Depends
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.core.database import async_session
    from app.models.database import SimulationHistory

    async with async_session() as db:
        record = await db.get(SimulationHistory, simulation_id)
        if not record or record.protocol != "E91":
            raise HTTPException(status_code=404, detail="E91 simulation not found")
        return record.full_result
