"""
Pydantic Schemas for QKD Simulator API
Defines request/response models for BB84 and E91 protocols.
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


# ============ Enums ============

class Basis(str, Enum):
    """Measurement basis options."""
    Z = "Z"       # Computational basis (|0⟩, |1⟩)
    X = "X"       # Hadamard basis (|+⟩, |-⟩)
    D = "D"       # Diagonal basis (S + H gate)


class ProtocolType(str, Enum):
    """QKD Protocol types."""
    BB84 = "BB84"
    E91 = "E91"


# ============ BB84 Schemas ============

class BB84SimulationRequest(BaseModel):
    """Request schema for BB84 protocol simulation."""
    n_qubits: int = Field(
        default=9,
        ge=1,
        le=20,
        description="Number of qubits to use (1-20)"
    )
    bases: List[Basis] = Field(
        default=[Basis.Z, Basis.X],
        description="Measurement bases to use (Z, X, D)"
    )
    eve_attack: bool = Field(
        default=False,
        description="Whether to simulate eavesdropper (Eve) attack"
    )
    eve_intercept_ratio: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Fraction of qubits Eve intercepts (0.0-1.0)"
    )
    shots: int = Field(
        default=1024,
        ge=1,
        le=8192,
        description="Number of measurement shots"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "n_qubits": 9,
                "bases": ["Z", "X"],
                "eve_attack": False,
                "eve_intercept_ratio": 1.0,
                "shots": 1024
            }
        }


class BB84SimulationResult(BaseModel):
    """Response schema for BB84 simulation results."""
    # Circuit Information
    circuit_json: dict = Field(description="Quantum circuit in JSON format for visualization")
    circuit_depth: int = Field(description="Depth of the quantum circuit")
    
    # Key Information
    alice_bits: List[int] = Field(description="Alice's original random bits")
    alice_bases: List[str] = Field(description="Alice's encoding bases")
    bob_bases: List[str] = Field(description="Bob's measurement bases")
    bob_measurements: List[int] = Field(description="Bob's raw measurement results")
    
    # Sifted Keys
    sifted_alice_key: List[int] = Field(description="Alice's key after basis reconciliation")
    sifted_bob_key: List[int] = Field(description="Bob's key after basis reconciliation")
    matching_indices: List[int] = Field(description="Indices where Alice and Bob used same basis")
    
    # Eve Information (if attack enabled)
    eve_detected: bool = Field(description="Whether eavesdropping was detected")
    eve_intercepted_indices: Optional[List[int]] = Field(
        default=None,
        description="Indices of qubits Eve intercepted"
    )
    eve_bases: Optional[List[str]] = Field(
        default=None,
        description="Eve's measurement bases"
    )
    eve_measurements: Optional[List[int]] = Field(
        default=None,
        description="Eve's measurement results"
    )
    
    # Security Metrics
    qber: float = Field(description="Quantum Bit Error Rate (percentage)")
    is_secure: bool = Field(description="Whether the key exchange is secure (QBER <= 8.5%)")
    information_leakage: float = Field(description="Estimated information leakage to Eve")
    key_efficiency: float = Field(description="Sifted key length / original bits ratio")
    
    # Execution Metadata
    execution_time_ms: float = Field(description="Simulation execution time in milliseconds")
    shots_used: int = Field(description="Number of shots used in simulation")


class BB84PresetsResponse(BaseModel):
    """Response schema for BB84 configuration presets."""
    presets: List[dict] = Field(description="Available preset configurations")


# ============ E91 Schemas ============

class E91SimulationRequest(BaseModel):
    """Request schema for E91 protocol simulation."""
    n_pairs: int = Field(
        default=9,
        ge=1,
        le=20,
        description="Number of entangled pairs (1-20)"
    )
    alice_angles: List[float] = Field(
        default=[0.0, 45.0, 90.0],
        description="Alice's measurement angles in degrees"
    )
    bob_angles: List[float] = Field(
        default=[45.0, 90.0, 135.0],
        description="Bob's measurement angles in degrees"
    )
    eve_attack: bool = Field(
        default=False,
        description="Whether to simulate eavesdropper attack"
    )
    shots: int = Field(
        default=1024,
        ge=1,
        le=8192,
        description="Number of measurement shots per angle combination"
    )
    noise_level: float = Field(
        default=0.0,
        ge=0.0,
        le=0.5,
        description="Depolarizing noise level (0.0-0.5)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "n_pairs": 9,
                "alice_angles": [0.0, 45.0, 90.0],
                "bob_angles": [45.0, 90.0, 135.0],
                "eve_attack": False,
                "shots": 1024,
                "noise_level": 0.0
            }
        }


class CHSHResult(BaseModel):
    """CHSH inequality test results."""
    s_parameter: float = Field(description="CHSH S-parameter value")
    classical_bound: float = Field(default=2.0, description="Classical bound value")
    quantum_max: float = Field(default=2.828, description="Quantum maximum (2√2)")
    violates_classical: bool = Field(description="Whether quantum violation detected")
    expectation_values: dict = Field(description="E(a,b) values for each angle combination")


class E91SimulationResult(BaseModel):
    """Response schema for E91 simulation results."""
    # Circuit Information
    circuit_json: dict = Field(description="Quantum circuit in JSON format")
    circuit_depth: int = Field(description="Depth of the quantum circuit")
    
    # Measurement Results
    alice_angles_used: List[float] = Field(description="Alice's measurement angles")
    bob_angles_used: List[float] = Field(description="Bob's measurement angles")
    correlations: dict = Field(description="Measurement correlations by angle pair")
    
    # CHSH Analysis
    chsh_result: CHSHResult = Field(description="CHSH inequality test results")
    
    # Security
    is_secure: bool = Field(description="Whether the protocol is secure (CHSH > 2)")
    eve_detected: bool = Field(description="Whether Eve was detected via CHSH violation loss")
    
    # Generated Keys
    sifted_alice_key: List[int] = Field(description="Alice's sifted key")
    sifted_bob_key: List[int] = Field(description="Bob's sifted key")
    key_match_rate: float = Field(description="Percentage of matching key bits")
    
    # Execution Metadata
    execution_time_ms: float = Field(description="Simulation execution time in milliseconds")
    shots_per_combination: int = Field(description="Shots used per angle combination")


# ============ Common Schemas ============

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str = Field(description="Error message")
    detail: Optional[str] = Field(default=None, description="Detailed error information")
    error_code: Optional[str] = Field(default=None, description="Error code for programmatic handling")


class SimulationStatus(BaseModel):
    """Status of a running simulation."""
    id: str = Field(description="Simulation ID")
    status: str = Field(description="Status: pending, running, completed, failed")
    progress: float = Field(default=0.0, description="Progress percentage (0-100)")
    result: Optional[dict] = Field(default=None, description="Result when completed")
    error: Optional[str] = Field(default=None, description="Error message if failed")
