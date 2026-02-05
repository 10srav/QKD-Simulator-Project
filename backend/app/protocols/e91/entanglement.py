"""
E91 Entanglement Generator Module
Creates EPR pairs and Bell states for E91 protocol.
"""
import random
import math
from typing import List, Tuple, Dict, Any

try:
    from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
    from qiskit_aer import AerSimulator
    from qiskit_aer.noise import NoiseModel, depolarizing_error
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False


class EntanglementGenerator:
    """
    Generates entangled Bell states for E91 QKD protocol.
    
    Creates EPR pairs (|Φ+⟩ = (|00⟩ + |11⟩)/√2) shared between
    Alice and Bob, then performs angle-based measurements for
    CHSH inequality testing.
    """
    
    def __init__(
        self,
        n_pairs: int = 9,
        noise_level: float = 0.0
    ):
        """
        Initialize the entanglement generator.
        
        Args:
            n_pairs: Number of entangled pairs to create
            noise_level: Depolarizing noise level (0.0-0.5)
        """
        self.n_pairs = n_pairs
        self.noise_level = noise_level
        self.simulator = AerSimulator() if QISKIT_AVAILABLE else None
    
    def create_bell_pairs(self) -> Tuple[Any, Dict]:
        """
        Create EPR pairs (Bell state |Φ+⟩).
        
        Uses Hadamard + CNOT to create entanglement:
        |00⟩ → H⊗I → (|0⟩+|1⟩)/√2 ⊗ |0⟩ → CNOT → (|00⟩+|11⟩)/√2
        
        Returns:
            Tuple of (QuantumCircuit, circuit_json)
        """
        if not QISKIT_AVAILABLE:
            return self._create_mock_circuit()
        
        # We need 2 qubits per pair (Alice + Bob)
        n_qubits = self.n_pairs * 2
        
        # Create registers
        qr = QuantumRegister(n_qubits, 'q')
        cr = ClassicalRegister(n_qubits, 'c')
        circuit = QuantumCircuit(qr, cr)
        
        # Create Bell pairs
        for i in range(self.n_pairs):
            alice_qubit = 2 * i
            bob_qubit = 2 * i + 1
            
            # Create |Φ+⟩ = (|00⟩ + |11⟩)/√2
            circuit.h(qr[alice_qubit])  # Hadamard on Alice's qubit
            circuit.cx(qr[alice_qubit], qr[bob_qubit])  # CNOT
        
        circuit.barrier()
        
        # Convert to JSON for visualization
        circuit_json = self._circuit_to_json(circuit)
        
        return circuit, circuit_json
    
    def measure_correlations(
        self,
        circuit: Any,
        alice_angles: List[float],
        bob_angles: List[float],
        shots: int = 1024
    ) -> Dict:
        """
        Measure correlations between Alice and Bob at various angles.
        
        Args:
            circuit: The Bell state circuit
            alice_angles: Alice's measurement angles in degrees
            bob_angles: Bob's measurement angles in degrees
            shots: Number of shots per angle combination
            
        Returns:
            Dictionary of correlations by angle pair
        """
        if not QISKIT_AVAILABLE:
            return self._mock_correlations(alice_angles, bob_angles)
        
        correlations = {}
        
        for a_angle in alice_angles:
            for b_angle in bob_angles:
                key = f"({a_angle},{b_angle})"
                
                # Create measurement circuit for this angle pair
                meas_circuit = circuit.copy()
                
                # Apply rotation gates before measurement
                for i in range(self.n_pairs):
                    alice_qubit = 2 * i
                    bob_qubit = 2 * i + 1
                    
                    # Rotate Alice's qubit
                    a_rad = math.radians(a_angle)
                    meas_circuit.ry(-a_rad, alice_qubit)
                    
                    # Rotate Bob's qubit
                    b_rad = math.radians(b_angle)
                    meas_circuit.ry(-b_rad, bob_qubit)
                    
                    # Measure
                    meas_circuit.measure(alice_qubit, alice_qubit)
                    meas_circuit.measure(bob_qubit, bob_qubit)
                
                # Setup noise model if specified
                backend = self.simulator
                if self.noise_level > 0:
                    noise_model = NoiseModel()
                    error = depolarizing_error(self.noise_level, 1)
                    noise_model.add_all_qubit_quantum_error(error, ['h', 'ry'])
                    job = backend.run(meas_circuit, shots=shots, noise_model=noise_model)
                else:
                    job = backend.run(meas_circuit, shots=shots)
                
                result = job.result()
                counts = result.get_counts()
                
                # Calculate correlation for this angle pair
                corr = self._calculate_correlation(counts, self.n_pairs)
                correlations[key] = {
                    "alice_angle": a_angle,
                    "bob_angle": b_angle,
                    "correlation": corr,
                    "counts": counts,
                    "shots": shots
                }
        
        return correlations
    
    def _calculate_correlation(self, counts: Dict, n_pairs: int) -> float:
        """
        Calculate correlation coefficient E(θ_a, θ_b).
        
        E = P(same) - P(different)
        where same means both qubits measured same value.
        """
        same = 0
        different = 0
        total = sum(counts.values())
        
        for bitstring, count in counts.items():
            # Count same vs different for each pair
            for i in range(n_pairs):
                alice_idx = 2 * i
                bob_idx = 2 * i + 1
                
                if alice_idx < len(bitstring) and bob_idx < len(bitstring):
                    # Remember: Qiskit uses little-endian
                    a_bit = int(bitstring[-(alice_idx+1)])
                    b_bit = int(bitstring[-(bob_idx+1)])
                    
                    if a_bit == b_bit:
                        same += count
                    else:
                        different += count
        
        total_measurements = total * n_pairs
        if total_measurements == 0:
            return 0.0
        
        correlation = (same - different) / total_measurements
        return round(correlation, 4)
    
    def extract_keys(
        self,
        correlations: Dict,
        alice_angles: List[float],
        bob_angles: List[float]
    ) -> Tuple[List[int], List[int]]:
        """
        Extract sifted keys from correlated measurements.
        
        Keys are extracted from measurements where Alice and Bob
        used matching angles (perfect correlation expected).
        
        Returns:
            Tuple of (alice_key, bob_key)
        """
        alice_key = []
        bob_key = []
        
        # Find matching angle measurements
        for a_angle in alice_angles:
            for b_angle in bob_angles:
                key = f"({a_angle},{b_angle})"
                
                if key in correlations and a_angle == b_angle:
                    # Same angle - use for key generation
                    data = correlations[key]
                    counts = data.get("counts", {})
                    
                    # Extract bits from most common outcomes
                    for bitstring, count in counts.items():
                        for i in range(self.n_pairs):
                            if len(bitstring) > 2 * i + 1:
                                alice_key.append(int(bitstring[-(2*i+1)]))
                                bob_key.append(int(bitstring[-(2*i+2)]))
        
        return alice_key, bob_key
    
    def _circuit_to_json(self, circuit: Any) -> Dict:
        """Convert circuit to JSON for visualization."""
        gates = []
        
        for i in range(self.n_pairs):
            alice_qubit = 2 * i
            bob_qubit = 2 * i + 1
            
            gates.append({
                "type": "H",
                "targets": [alice_qubit],
                "section": "entanglement",
                "label": "Bell state"
            })
            gates.append({
                "type": "CNOT",
                "targets": [alice_qubit, bob_qubit],
                "section": "entanglement",
                "label": "Entangle"
            })
        
        gates.append({
            "type": "BARRIER",
            "targets": list(range(self.n_pairs * 2)),
            "section": "measurement"
        })
        
        return {
            "n_qubits": self.n_pairs * 2,
            "n_classical": self.n_pairs * 2,
            "gates": gates,
            "depth": circuit.depth() if QISKIT_AVAILABLE else 3,
            "metadata": {
                "protocol": "E91",
                "n_pairs": self.n_pairs,
                "noise_level": self.noise_level
            }
        }
    
    def _create_mock_circuit(self) -> Tuple[None, Dict]:
        """Create mock circuit when Qiskit unavailable."""
        return None, {
            "n_qubits": self.n_pairs * 2,
            "n_classical": self.n_pairs * 2,
            "gates": [],
            "depth": 3,
            "metadata": {"protocol": "E91", "mock": True}
        }
    
    def _mock_correlations(
        self,
        alice_angles: List[float],
        bob_angles: List[float]
    ) -> Dict:
        """Generate mock correlations for testing."""
        correlations = {}
        
        for a_angle in alice_angles:
            for b_angle in bob_angles:
                key = f"({a_angle},{b_angle})"
                
                # Quantum correlation formula: -cos(θ_a - θ_b)
                angle_diff = math.radians(a_angle - b_angle)
                expected_corr = -math.cos(angle_diff)
                
                # Add some randomness
                noise = random.uniform(-0.1, 0.1)
                corr = max(-1, min(1, expected_corr + noise))
                
                correlations[key] = {
                    "alice_angle": a_angle,
                    "bob_angle": b_angle,
                    "correlation": round(corr, 4),
                    "counts": {"mock": 1024},
                    "shots": 1024
                }
        
        return correlations
