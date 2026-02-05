"""
BB84 Eve Attack Module
Simulates eavesdropper's intercept-resend attack.
"""
import random
from typing import List, Dict


class EveAttacker:
    """
    Simulates Eve's intercept-resend attack on BB84 protocol.
    
    Eve intercepts qubits during transmission, measures them
    in a random basis, and re-sends based on her measurement.
    This introduces errors when Eve's basis doesn't match Alice's.
    """
    
    def __init__(
        self,
        n_qubits: int,
        intercept_ratio: float = 1.0,
        bases: List[str] = None
    ):
        """
        Initialize the Eve attacker.
        
        Args:
            n_qubits: Number of qubits in the protocol
            intercept_ratio: Fraction of qubits Eve intercepts (0.0-1.0)
            bases: Available bases for Eve's measurements
        """
        self.n_qubits = n_qubits
        self.intercept_ratio = intercept_ratio
        self.bases = bases or ["Z", "X"]
    
    def intercept(
        self,
        alice_bits: List[int],
        alice_bases: List[str],
        bob_bases: List[str],
        bob_measurements: List[int]
    ) -> Dict:
        """
        Perform intercept-resend attack.
        
        Eve:
        1. Randomly selects which qubits to intercept
        2. Measures each intercepted qubit in a random basis
        3. Re-prepares and sends based on her measurement
        
        If Eve's basis matches Alice's, Bob receives correct value.
        If Eve's basis differs from Alice's, ~50% error introduced.
        
        Args:
            alice_bits: Alice's original bits
            alice_bases: Alice's encoding bases
            bob_bases: Bob's measurement bases
            bob_measurements: Bob's original measurements (will be modified)
            
        Returns:
            Dictionary with Eve's attack details and modified measurements
        """
        n = len(alice_bits)
        
        # Determine which qubits Eve intercepts
        n_intercept = int(n * self.intercept_ratio)
        intercepted_indices = random.sample(range(n), min(n_intercept, n))
        intercepted_indices.sort()
        
        # Eve's random bases and measurements
        eve_bases = []
        eve_measurements = []
        
        # Modified Bob measurements after Eve's interference
        modified_bob = bob_measurements.copy()
        
        # Track Eve's information gain
        eve_correct_guesses = 0
        
        for i in intercepted_indices:
            # Eve chooses a random basis to measure
            eve_basis = random.choice(self.bases)
            eve_bases.append(eve_basis)
            
            # Eve's measurement result
            if eve_basis == alice_bases[i]:
                # Eve used same basis as Alice - she gets correct value
                eve_measurement = alice_bits[i]
                eve_correct_guesses += 1
            else:
                # Eve used different basis - random result
                eve_measurement = random.randint(0, 1)
            
            eve_measurements.append(eve_measurement)
            
            # Now Eve re-prepares the qubit and sends to Bob
            # If Eve's basis differs from Bob's, introduces errors
            if eve_basis != bob_bases[i]:
                # Random error introduced
                if random.random() < 0.5:
                    modified_bob[i] = 1 - bob_measurements[i]  # Flip bit
            elif eve_basis != alice_bases[i]:
                # Eve's re-preparation based on wrong measurement
                # Bob might get wrong value
                modified_bob[i] = eve_measurement
        
        return {
            "intercepted_indices": intercepted_indices,
            "eve_bases": eve_bases,
            "eve_measurements": eve_measurements,
            "modified_bob_measurements": modified_bob,
            "eve_correct_guesses": eve_correct_guesses,
            "eve_intercept_count": len(intercepted_indices),
            "intercept_ratio_actual": len(intercepted_indices) / n if n > 0 else 0
        }
    
    def calculate_expected_error(self, alice_bases: List[str]) -> float:
        """
        Calculate expected error rate from Eve's attack.
        
        With random basis selection:
        - 2 bases: 50% match rate → 25% expected QBER
        - 3 bases: 33% match rate → ~33% expected QBER
        
        Args:
            alice_bases: Alice's encoding bases
            
        Returns:
            Expected QBER from attack
        """
        n_bases = len(set(self.bases))
        match_probability = 1 / n_bases
        
        # Error occurs when:
        # 1. Eve uses wrong basis (~(n-1)/n probability)
        # 2. AND her re-preparation causes error (~50% when wrong basis)
        error_probability = (1 - match_probability) * 0.5
        
        # Apply intercept ratio
        effective_error = error_probability * self.intercept_ratio
        
        return effective_error * 100  # Return as percentage
