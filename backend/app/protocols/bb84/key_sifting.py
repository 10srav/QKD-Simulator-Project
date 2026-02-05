"""
BB84 Key Sifting Module
Performs basis reconciliation to extract matching key bits.
"""
from typing import List, Dict


class KeySifter:
    """
    Performs key sifting (basis reconciliation) for BB84 protocol.
    
    After quantum transmission, Alice and Bob publicly announce
    their bases (but not the bit values). They keep only the bits
    where they used the same basis - these form the sifted key.
    """
    
    def sift_keys(
        self,
        alice_bits: List[int],
        alice_bases: List[str],
        bob_measurements: List[int],
        bob_bases: List[str]
    ) -> Dict:
        """
        Perform key sifting between Alice and Bob.
        
        Args:
            alice_bits: Alice's original random bits
            alice_bases: Alice's encoding bases
            bob_measurements: Bob's measurement results
            bob_bases: Bob's measurement bases
            
        Returns:
            Dictionary containing:
            - alice_key: Alice's sifted key
            - bob_key: Bob's sifted key  
            - matching_indices: Indices where bases matched
            - efficiency: Ratio of sifted bits to total bits
        """
        alice_key = []
        bob_key = []
        matching_indices = []
        
        n_qubits = len(alice_bits)
        
        for i in range(n_qubits):
            # Only keep bits where Alice and Bob used the same basis
            if alice_bases[i] == bob_bases[i]:
                alice_key.append(alice_bits[i])
                bob_key.append(bob_measurements[i])
                matching_indices.append(i)
        
        # Calculate sifting efficiency
        efficiency = len(alice_key) / n_qubits if n_qubits > 0 else 0.0
        
        return {
            "alice_key": alice_key,
            "bob_key": bob_key,
            "matching_indices": matching_indices,
            "efficiency": efficiency,
            "total_bits": n_qubits,
            "sifted_bits": len(alice_key)
        }
    
    def compare_keys(
        self,
        alice_key: List[int],
        bob_key: List[int]
    ) -> Dict:
        """
        Compare Alice's and Bob's sifted keys.
        
        This is used during error estimation phase.
        In practice, they would only compare a sample of bits.
        
        Args:
            alice_key: Alice's sifted key
            bob_key: Bob's sifted key
            
        Returns:
            Dictionary with comparison results
        """
        if len(alice_key) != len(bob_key):
            return {
                "match": False,
                "error": "Key lengths don't match",
                "alice_length": len(alice_key),
                "bob_length": len(bob_key)
            }
        
        mismatches = []
        for i in range(len(alice_key)):
            if alice_key[i] != bob_key[i]:
                mismatches.append(i)
        
        match_rate = 1.0 - (len(mismatches) / len(alice_key)) if len(alice_key) > 0 else 0.0
        
        return {
            "match": len(mismatches) == 0,
            "match_rate": match_rate,
            "total_bits": len(alice_key),
            "mismatches": len(mismatches),
            "mismatch_indices": mismatches
        }
