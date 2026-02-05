"""
CHSH Inequality Validator
Tests Bell's inequality to detect eavesdropping.
"""
import math
from typing import Dict, List


class CHSHValidator:
    """
    Validates CHSH inequality for E91 protocol security.
    
    The CHSH inequality is:
    S = |E(a,b) + E(a,b') + E(a',b) - E(a',b')| ≤ 2
    
    Quantum mechanics allows violations up to 2√2 ≈ 2.828.
    If S > 2, quantum correlations confirmed (secure).
    If S ≤ 2, classical eavesdropping possible (insecure).
    """
    
    CLASSICAL_BOUND = 2.0
    QUANTUM_MAX = 2 * math.sqrt(2)  # ≈ 2.828
    
    def calculate_chsh(self, correlations: Dict) -> Dict:
        """
        Calculate CHSH S-parameter from correlations.
        
        Uses the standard CHSH angles:
        Alice: a=0°, a'=45°
        Bob: b=22.5°, b'=67.5°
        
        Or uses provided correlations with closest matches.
        
        Args:
            correlations: Dictionary of correlation data by angle pair
            
        Returns:
            Dictionary with S-parameter and detailed breakdown
        """
        # Extract expectation values
        expectation_values = {}
        
        for key, data in correlations.items():
            a_angle = data.get("alice_angle", 0)
            b_angle = data.get("bob_angle", 0)
            corr = data.get("correlation", 0)
            expectation_values[f"E({a_angle},{b_angle})"] = corr
        
        # Find angle combinations for CHSH
        # Standard optimal angles: a=0, a'=45, b=22.5, b'=67.5
        # But we'll use available angles
        
        available_alice = set()
        available_bob = set()
        
        for key, data in correlations.items():
            available_alice.add(data.get("alice_angle", 0))
            available_bob.add(data.get("bob_angle", 0))
        
        alice_angles = sorted(list(available_alice))
        bob_angles = sorted(list(available_bob))
        
        # Calculate S-parameter using available angles
        if len(alice_angles) >= 2 and len(bob_angles) >= 2:
            a, a_prime = alice_angles[0], alice_angles[1]
            b, b_prime = bob_angles[0], bob_angles[1]
            
            E_ab = self._get_correlation(correlations, a, b)
            E_ab_prime = self._get_correlation(correlations, a, b_prime)
            E_a_prime_b = self._get_correlation(correlations, a_prime, b)
            E_a_prime_b_prime = self._get_correlation(correlations, a_prime, b_prime)
            
            # CHSH formula
            S = abs(E_ab + E_ab_prime + E_a_prime_b - E_a_prime_b_prime)
            
            return {
                "s_parameter": round(S, 4),
                "violates_classical": S > self.CLASSICAL_BOUND,
                "classical_bound": self.CLASSICAL_BOUND,
                "quantum_max": round(self.QUANTUM_MAX, 4),
                "angles_used": {
                    "a": a,
                    "a_prime": a_prime,
                    "b": b,
                    "b_prime": b_prime
                },
                "expectation_values": expectation_values,
                "terms": {
                    "E(a,b)": E_ab,
                    "E(a,b')": E_ab_prime,
                    "E(a',b)": E_a_prime_b,
                    "E(a',b')": E_a_prime_b_prime
                }
            }
        else:
            # Not enough angles for proper CHSH test
            return {
                "s_parameter": 0.0,
                "violates_classical": False,
                "error": "Insufficient angle combinations for CHSH test",
                "expectation_values": expectation_values,
                "classical_bound": self.CLASSICAL_BOUND,
                "quantum_max": round(self.QUANTUM_MAX, 4)
            }
    
    def _get_correlation(
        self,
        correlations: Dict,
        alice_angle: float,
        bob_angle: float
    ) -> float:
        """Get correlation for specific angle pair."""
        key = f"({alice_angle},{bob_angle})"
        
        if key in correlations:
            return correlations[key].get("correlation", 0)
        
        # Try to find closest match
        for k, data in correlations.items():
            if (data.get("alice_angle") == alice_angle and 
                data.get("bob_angle") == bob_angle):
                return data.get("correlation", 0)
        
        return 0.0
    
    def get_theoretical_s(
        self,
        alice_angles: List[float] = None,
        bob_angles: List[float] = None
    ) -> float:
        """
        Calculate theoretical S-parameter for given angles.
        
        For optimal angles (0, 45 for Alice; 22.5, 67.5 for Bob),
        S = 2√2 ≈ 2.828.
        
        Args:
            alice_angles: [a, a'] in degrees
            bob_angles: [b, b'] in degrees
            
        Returns:
            Theoretical S value
        """
        if alice_angles is None:
            alice_angles = [0, 45]
        if bob_angles is None:
            bob_angles = [22.5, 67.5]
        
        a, a_prime = math.radians(alice_angles[0]), math.radians(alice_angles[1])
        b, b_prime = math.radians(bob_angles[0]), math.radians(bob_angles[1])
        
        # Quantum correlation: E(θ_a, θ_b) = -cos(θ_a - θ_b)
        E_ab = -math.cos(a - b)
        E_ab_prime = -math.cos(a - b_prime)
        E_a_prime_b = -math.cos(a_prime - b)
        E_a_prime_b_prime = -math.cos(a_prime - b_prime)
        
        S = abs(E_ab + E_ab_prime + E_a_prime_b - E_a_prime_b_prime)
        
        return round(S, 4)
    
    def interpret_result(self, s_parameter: float) -> Dict:
        """
        Interpret CHSH result for security assessment.
        
        Args:
            s_parameter: Calculated S value
            
        Returns:
            Security interpretation
        """
        if s_parameter > 2.5:
            return {
                "status": "secure",
                "message": "Strong quantum violation detected",
                "explanation": "Correlations are genuinely quantum - no eavesdropper",
                "confidence": "high",
                "color": "green"
            }
        elif s_parameter > self.CLASSICAL_BOUND:
            return {
                "status": "marginal",
                "message": "Weak quantum violation detected",
                "explanation": "Some quantum correlations present, but noise or partial eavesdropping possible",
                "confidence": "medium",
                "color": "yellow"
            }
        elif s_parameter > 1.5:
            return {
                "status": "suspicious",
                "message": "Below classical bound but non-zero correlations",
                "explanation": "Possible eavesdropping or severe decoherence",
                "confidence": "low",
                "color": "orange"
            }
        else:
            return {
                "status": "insecure",
                "message": "No quantum violation - channel compromised",
                "explanation": "Classical correlations only - eavesdropper present",
                "confidence": "high",
                "color": "red"
            }
