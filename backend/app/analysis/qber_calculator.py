"""
QBER Calculator Module
Computes Quantum Bit Error Rate and security metrics.
"""
from typing import List, Dict


class QBERCalculator:
    """
    Calculates Quantum Bit Error Rate (QBER) for QKD protocols.
    
    QBER is the percentage of bits that differ between Alice's
    and Bob's sifted keys. A QBER > 8.5% typically indicates
    eavesdropping in BB84.
    """
    
    # Security threshold based on BB84 theory
    # Above this QBER, the channel is considered insecure
    SECURITY_THRESHOLD = 8.5  # Percentage
    
    def calculate(
        self,
        alice_key: List[int],
        bob_key: List[int]
    ) -> Dict:
        """
        Calculate QBER between Alice's and Bob's sifted keys.
        
        QBER = (mismatched_bits / total_sifted_bits) × 100
        
        Args:
            alice_key: Alice's sifted key bits
            bob_key: Bob's sifted key bits
            
        Returns:
            Dictionary containing QBER and security assessment
        """
        if len(alice_key) == 0 or len(bob_key) == 0:
            return {
                "qber": 0.0,
                "is_secure": True,
                "mismatched_bits": 0,
                "total_bits": 0,
                "threshold": self.SECURITY_THRESHOLD,
                "margin": self.SECURITY_THRESHOLD
            }
        
        # Ensure equal lengths
        min_len = min(len(alice_key), len(bob_key))
        alice_key = alice_key[:min_len]
        bob_key = bob_key[:min_len]
        
        # Count mismatched bits
        mismatched = sum(1 for a, b in zip(alice_key, bob_key) if a != b)
        
        # Calculate QBER percentage
        qber = (mismatched / min_len) * 100
        
        # Security assessment
        is_secure = qber <= self.SECURITY_THRESHOLD
        
        return {
            "qber": round(qber, 2),
            "is_secure": is_secure,
            "mismatched_bits": mismatched,
            "total_bits": min_len,
            "threshold": self.SECURITY_THRESHOLD,
            "margin": round(self.SECURITY_THRESHOLD - qber, 2)
        }
    
    def calculate_information_leakage(
        self,
        eve_correct: int,
        eve_total: int
    ) -> float:
        """
        Estimate information leakage to Eve.
        
        This approximates how much of the key Eve might know
        based on her successful measurements.
        
        Args:
            eve_correct: Number of bits Eve correctly measured
            eve_total: Total bits Eve intercepted
            
        Returns:
            Information leakage as percentage (0-100)
        """
        if eve_total == 0:
            return 0.0
        
        # Raw success rate
        success_rate = eve_correct / eve_total
        
        # Information-theoretic leakage estimate
        # Eve's information is bounded by her measurement success
        leakage = success_rate * 100
        
        return round(leakage, 2)
    
    def get_security_recommendation(self, qber: float) -> Dict:
        """
        Get security recommendation based on QBER.
        
        Args:
            qber: Calculated QBER percentage
            
        Returns:
            Dictionary with recommendation and action
        """
        if qber <= 5.0:
            return {
                "status": "excellent",
                "message": "Channel is highly secure",
                "action": "Proceed with key generation",
                "color": "green"
            }
        elif qber <= 8.5:
            return {
                "status": "acceptable",
                "message": "Channel is secure but noisy",
                "action": "Consider privacy amplification",
                "color": "yellow"
            }
        elif qber <= 15.0:
            return {
                "status": "warning",
                "message": "Possible eavesdropping detected",
                "action": "Abort key exchange, investigate",
                "color": "orange"
            }
        else:
            return {
                "status": "critical",
                "message": "Eavesdropping highly likely",
                "action": "Abort immediately, channel compromised",
                "color": "red"
            }
    
    def estimate_secure_key_length(
        self,
        sifted_length: int,
        qber: float
    ) -> int:
        """
        Estimate final secure key length after privacy amplification.
        
        Uses simplified Shannon entropy bound to estimate
        how much key material can be extracted securely.
        
        Args:
            sifted_length: Length of sifted key
            qber: QBER percentage
            
        Returns:
            Estimated secure key length
        """
        if qber >= self.SECURITY_THRESHOLD:
            return 0
        
        # Binary entropy function approximation
        qber_frac = qber / 100
        if qber_frac == 0:
            efficiency = 1.0
        else:
            import math
            h_q = -qber_frac * math.log2(qber_frac) - (1-qber_frac) * math.log2(1-qber_frac)
            efficiency = 1 - 2 * h_q  # Rough privacy amplification bound
        
        secure_length = int(sifted_length * max(0, efficiency))
        return secure_length
