"""
BB84 Quantum Circuit Builder
Constructs quantum circuits for the BB84 QKD protocol.
"""
import random
from typing import List, Tuple, Dict, Any

try:
    from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
    from qiskit_aer import AerSimulator
    QISKIT_AVAILABLE = True
except ImportError:
    QISKIT_AVAILABLE = False


class BB84CircuitBuilder:
    """
    Builds quantum circuits for BB84 protocol simulation.
    
    The BB84 protocol uses two or three bases:
    - Z (Computational): |0⟩, |1⟩
    - X (Hadamard): |+⟩, |-⟩  
    - D (Diagonal): Uses S gate + H gate
    
    Alice prepares qubits, Bob measures them.
    Security comes from basis mismatch detection.
    """
    
    def __init__(self, n_qubits: int = 9, bases: List[str] = None):
        """
        Initialize the circuit builder.
        
        Args:
            n_qubits: Number of qubits to use (1-20)
            bases: List of bases to use ("Z", "X", "D")
        """
        self.n_qubits = n_qubits
        self.bases = bases or ["Z", "X"]
        self.simulator = AerSimulator() if QISKIT_AVAILABLE else None
        
    def generate_alice_data(self) -> Tuple[List[int], List[str]]:
        """
        Generate Alice's random bits and encoding bases.
        
        Returns:
            Tuple of (bits, bases) where:
            - bits: Random 0/1 values Alice will encode
            - bases: Random bases Alice will use for encoding
        """
        bits = [random.randint(0, 1) for _ in range(self.n_qubits)]
        bases = [random.choice(self.bases) for _ in range(self.n_qubits)]
        return bits, bases
    
    def generate_bob_bases(self) -> List[str]:
        """
        Generate Bob's random measurement bases.
        
        Returns:
            List of random bases Bob will use for measurement
        """
        return [random.choice(self.bases) for _ in range(self.n_qubits)]
    
    def build_circuit(
        self,
        alice_bits: List[int],
        alice_bases: List[str],
        bob_bases: List[str],
        shots: int = 1024
    ) -> Tuple[Any, Dict]:
        """
        Build the complete BB84 quantum circuit.
        
        This creates a circuit with three sections:
        1. Alice's preparation (encoding bits in chosen bases)
        2. Transmission (barrier for visualization)
        3. Bob's measurement (in his chosen bases)
        
        Args:
            alice_bits: Alice's random bit string
            alice_bases: Alice's encoding bases
            bob_bases: Bob's measurement bases
            shots: Number of measurement shots
            
        Returns:
            Tuple of (QuantumCircuit, circuit_json)
        """
        if not QISKIT_AVAILABLE:
            return self._build_mock_circuit(alice_bits, alice_bases, bob_bases)
        
        # Create quantum and classical registers
        qr = QuantumRegister(self.n_qubits, 'q')
        cr = ClassicalRegister(self.n_qubits, 'c')
        circuit = QuantumCircuit(qr, cr)
        
        # === Alice's Preparation ===
        for i in range(self.n_qubits):
            bit = alice_bits[i]
            basis = alice_bases[i]
            
            # Encode the bit value
            if bit == 1:
                circuit.x(qr[i])
            
            # Apply basis transformation
            if basis == "X":
                # Hadamard basis: |+⟩ = H|0⟩, |-⟩ = H|1⟩
                circuit.h(qr[i])
            elif basis == "D":
                # Diagonal basis: S gate + Hadamard
                circuit.s(qr[i])
                circuit.h(qr[i])
            # Z basis: No additional gate needed
        
        # Transmission barrier (for visualization)
        circuit.barrier()
        
        # === Bob's Measurement ===
        for i in range(self.n_qubits):
            basis = bob_bases[i]
            
            # Transform to measurement basis before measuring
            if basis == "X":
                circuit.h(qr[i])
            elif basis == "D":
                circuit.h(qr[i])
                circuit.sdg(qr[i])  # S-dagger to undo Alice's S
            # Z basis: Measure directly
            
            circuit.measure(qr[i], cr[i])
        
        # Convert circuit to JSON for frontend visualization
        circuit_json = self._circuit_to_json(circuit, alice_bits, alice_bases, bob_bases)
        
        return circuit, circuit_json
    
    def execute(self, circuit: Any, shots: int = 1024) -> List[int]:
        """
        Execute the quantum circuit and return Bob's measurements.
        
        Args:
            circuit: The QuantumCircuit to execute
            shots: Number of measurement shots
            
        Returns:
            List of Bob's measurement results (most frequent outcome)
        """
        if not QISKIT_AVAILABLE:
            return self._mock_execute(shots)
        
        # Run simulation
        job = self.simulator.run(circuit, shots=shots)
        result = job.result()
        counts = result.get_counts()
        
        # Get most frequent measurement outcome
        most_frequent = max(counts, key=counts.get)
        
        # Reverse bit string (Qiskit uses little-endian)
        # Convert to list of integers
        measurements = [int(b) for b in reversed(most_frequent)]
        
        return measurements
    
    def _circuit_to_json(
        self,
        circuit: Any,
        alice_bits: List[int],
        alice_bases: List[str],
        bob_bases: List[str]
    ) -> Dict:
        """
        Convert quantum circuit to JSON for frontend visualization.
        
        Returns a structured representation suitable for rendering.
        """
        gates = []
        
        # Add Alice's preparation gates
        for i in range(self.n_qubits):
            bit = alice_bits[i]
            basis = alice_bases[i]
            
            if bit == 1:
                gates.append({
                    "type": "X",
                    "targets": [i],
                    "section": "alice",
                    "label": "Encode 1"
                })
            
            if basis == "X":
                gates.append({
                    "type": "H",
                    "targets": [i],
                    "section": "alice",
                    "label": "X-basis"
                })
            elif basis == "D":
                gates.append({
                    "type": "S",
                    "targets": [i],
                    "section": "alice",
                    "label": "D-basis"
                })
                gates.append({
                    "type": "H",
                    "targets": [i],
                    "section": "alice",
                    "label": "D-basis"
                })
        
        # Add barrier
        gates.append({
            "type": "BARRIER",
            "targets": list(range(self.n_qubits)),
            "section": "transmission"
        })
        
        # Add Bob's measurement gates
        for i in range(self.n_qubits):
            basis = bob_bases[i]
            
            if basis == "X":
                gates.append({
                    "type": "H",
                    "targets": [i],
                    "section": "bob",
                    "label": "X-measure"
                })
            elif basis == "D":
                gates.append({
                    "type": "H",
                    "targets": [i],
                    "section": "bob",
                    "label": "D-measure"
                })
                gates.append({
                    "type": "Sdg",
                    "targets": [i],
                    "section": "bob",
                    "label": "D-measure"
                })
            
            gates.append({
                "type": "MEASURE",
                "targets": [i],
                "section": "bob"
            })
        
        return {
            "n_qubits": self.n_qubits,
            "n_classical": self.n_qubits,
            "gates": gates,
            "depth": circuit.depth() if QISKIT_AVAILABLE and hasattr(circuit, 'depth') else len(gates),
            "metadata": {
                "protocol": "BB84",
                "bases_used": self.bases,
                "alice_bits": alice_bits,
                "alice_bases": alice_bases,
                "bob_bases": bob_bases
            }
        }
    
    def _build_mock_circuit(
        self,
        alice_bits: List[int],
        alice_bases: List[str],
        bob_bases: List[str]
    ) -> Tuple[None, Dict]:
        """Build a mock circuit when Qiskit is not available."""
        circuit_json = self._circuit_to_json(None, alice_bits, alice_bases, bob_bases)
        circuit_json["depth"] = self.n_qubits * 3
        return None, circuit_json
    
    def _mock_execute(self, shots: int) -> List[int]:
        """Mock execution when Qiskit is not available."""
        return [random.randint(0, 1) for _ in range(self.n_qubits)]
