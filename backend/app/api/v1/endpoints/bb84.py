"""
BB84 Protocol API Endpoints
Implements Quantum Key Distribution using the BB84 protocol.
"""
from fastapi import APIRouter, HTTPException
from typing import List
import time

from app.models.schemas import (
    BB84SimulationRequest,
    BB84SimulationResult,
    BB84PresetsResponse,
    Basis,
)
from app.protocols.bb84.circuit_builder import BB84CircuitBuilder
from app.protocols.bb84.key_sifting import KeySifter
from app.protocols.bb84.eve_attack import EveAttacker
from app.analysis.qber_calculator import QBERCalculator
from app.services.history_service import save_bb84_result

router = APIRouter()


# Preset configurations based on IEEE paper
BB84_PRESETS = [
    {
        "name": "Basic 9-Qubit (2 Bases)",
        "description": "Simple BB84 with 9 qubits, Z and X bases",
        "config": {"n_qubits": 9, "bases": ["Z", "X"], "eve_attack": False}
    },
    {
        "name": "9-Qubit with Eve Attack",
        "description": "BB84 with eavesdropper to demonstrate QBER detection",
        "config": {"n_qubits": 9, "bases": ["Z", "X"], "eve_attack": True, "eve_intercept_ratio": 1.0}
    },
    {
        "name": "12-Qubit (3 Bases)",
        "description": "Extended BB84 with Diagonal basis",
        "config": {"n_qubits": 12, "bases": ["Z", "X", "D"], "eve_attack": False}
    },
    {
        "name": "16-Qubit Full",
        "description": "Maximum configuration for comprehensive testing",
        "config": {"n_qubits": 16, "bases": ["Z", "X", "D"], "eve_attack": False}
    },
    {
        "name": "16-Qubit with Eve",
        "description": "Full configuration with eavesdropper attack",
        "config": {"n_qubits": 16, "bases": ["Z", "X", "D"], "eve_attack": True, "eve_intercept_ratio": 0.5}
    },
]


@router.get("/presets", response_model=BB84PresetsResponse)
async def get_presets():
    """
    Get available BB84 preset configurations.
    
    These presets are based on configurations from published research
    and provide good starting points for experimentation.
    """
    return BB84PresetsResponse(presets=BB84_PRESETS)


@router.post("/simulate", response_model=BB84SimulationResult)
async def simulate_bb84(request: BB84SimulationRequest):
    """
    Run a BB84 Quantum Key Distribution simulation.
    
    This endpoint simulates the complete BB84 protocol:
    1. Alice prepares qubits in random states using random bases
    2. (Optional) Eve intercepts and measures qubits
    3. Bob measures qubits using random bases
    4. Alice and Bob perform basis reconciliation (sifting)
    5. QBER is calculated to detect potential eavesdropping
    
    **Security Threshold**: QBER > 8.5% indicates potential eavesdropping.
    
    Returns complete simulation results including:
    - Quantum circuit visualization data
    - Sifted keys for Alice and Bob
    - QBER and security analysis
    - Eve's activity details (if enabled)
    """
    start_time = time.time()
    
    try:
        # Convert bases to list of strings
        bases = [b.value for b in request.bases]
        
        # Build the BB84 circuit
        circuit_builder = BB84CircuitBuilder(
            n_qubits=request.n_qubits,
            bases=bases
        )
        
        # Generate Alice's random bits and bases
        alice_bits, alice_bases = circuit_builder.generate_alice_data()
        
        # Generate Bob's random measurement bases
        bob_bases = circuit_builder.generate_bob_bases()
        
        # Build and execute the circuit
        circuit, circuit_json = circuit_builder.build_circuit(
            alice_bits=alice_bits,
            alice_bases=alice_bases,
            bob_bases=bob_bases,
            shots=request.shots
        )
        
        # Execute simulation
        bob_measurements = circuit_builder.execute(circuit, shots=request.shots)
        
        # Apply Eve attack if enabled
        eve_data = None
        if request.eve_attack:
            eve_attacker = EveAttacker(
                n_qubits=request.n_qubits,
                intercept_ratio=request.eve_intercept_ratio,
                bases=bases
            )
            eve_data = eve_attacker.intercept(
                alice_bits=alice_bits,
                alice_bases=alice_bases,
                bob_bases=bob_bases,
                bob_measurements=bob_measurements
            )
            # Eve's interference modifies Bob's measurements
            bob_measurements = eve_data["modified_bob_measurements"]
        
        # Perform key sifting
        key_sifter = KeySifter()
        sifted_result = key_sifter.sift_keys(
            alice_bits=alice_bits,
            alice_bases=alice_bases,
            bob_measurements=bob_measurements,
            bob_bases=bob_bases
        )
        
        # Calculate QBER
        qber_calculator = QBERCalculator()
        qber_result = qber_calculator.calculate(
            alice_key=sifted_result["alice_key"],
            bob_key=sifted_result["bob_key"]
        )
        
        # Calculate information leakage (if Eve attacked)
        info_leakage = 0.0
        if eve_data:
            info_leakage = qber_calculator.calculate_information_leakage(
                eve_correct=eve_data.get("eve_correct_guesses", 0),
                eve_total=eve_data.get("eve_intercept_count", 1)
            )
        
        execution_time = (time.time() - start_time) * 1000

        result = BB84SimulationResult(
            circuit_json=circuit_json,
            circuit_depth=circuit.depth() if hasattr(circuit, 'depth') else 0,
            alice_bits=alice_bits,
            alice_bases=alice_bases,
            bob_bases=bob_bases,
            bob_measurements=bob_measurements,
            sifted_alice_key=sifted_result["alice_key"],
            sifted_bob_key=sifted_result["bob_key"],
            matching_indices=sifted_result["matching_indices"],
            eve_detected=qber_result["qber"] > 8.5,
            eve_intercepted_indices=eve_data.get("intercepted_indices") if eve_data else None,
            eve_bases=eve_data.get("eve_bases") if eve_data else None,
            eve_measurements=eve_data.get("eve_measurements") if eve_data else None,
            qber=qber_result["qber"],
            is_secure=qber_result["is_secure"],
            information_leakage=info_leakage,
            key_efficiency=sifted_result["efficiency"],
            execution_time_ms=execution_time,
            shots_used=request.shots
        )

        # Persist to history
        try:
            await save_bb84_result(
                config=request.model_dump(mode="json"),
                result=result.model_dump(mode="json"),
            )
        except Exception:
            pass  # Don't fail the simulation if history save fails

        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {str(e)}"
        )
