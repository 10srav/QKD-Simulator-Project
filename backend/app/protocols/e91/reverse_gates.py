"""
E91 Reverse Gates Module
Implements anti-eavesdropping mechanism using reverse gates.
"""
import math
from typing import Dict, Any


class ReverseGateHandler:
    """
    Handles reverse gate mechanism for E91 protocol security.
    
    When CHSH inequality is not violated (Eve detected), this
    module applies inverse gates to corrupt Eve's information
    while preserving legitimate communication.
    
    Based on IEEE paper's enhancement: 158° phase shift
    collapses entangled state from |10⟩ to |11⟩.
    """
    
    # Phase angle for reverse operation (from paper)
    REVERSE_PHASE = 158  # degrees
    
    def apply_reverse_gates(
        self,
        correlations: Dict,
        s_parameter: float
    ) -> Dict:
        """
        Apply reverse gates when Eve is detected.
        
        The reverse gate mechanism works by:
        1. Detecting CHSH violation failure (S ≤ 2)
        2. Applying phase-shifted gates to remaining qubits
        3. Eve's intercepted information becomes garbage
        
        Args:
            correlations: Current measurement correlations
            s_parameter: Calculated CHSH S-parameter
            
        Returns:
            Updated state after reverse gates
        """
        if s_parameter > 2.0:
            # No Eve detected, no action needed
            return {
                "action": "none",
                "reason": "CHSH violation confirmed - channel secure",
                "s_parameter": s_parameter
            }
        
        # Eve detected - apply reverse gates
        phase_rad = math.radians(self.REVERSE_PHASE)
        
        # Calculate transformation matrix for documentation
        # U = exp(i·θ·Z) where θ = 158°
        transform = {
            "phase_angle": self.REVERSE_PHASE,
            "gate_sequence": ["S", "Z", "S†"],
            "effect": "Decorrelates Eve's measurements"
        }
        
        # Modify correlations to reflect reverse gate effect
        modified_correlations = {}
        for key, data in correlations.items():
            modified = data.copy()
            
            # Reduce correlation (Eve's info becomes random)
            original_corr = data.get("correlation", 0)
            # Phase shift reduces correlation by cos(θ) factor
            modified["correlation"] = original_corr * math.cos(phase_rad)
            modified["reverse_gate_applied"] = True
            
            modified_correlations[key] = modified
        
        return {
            "action": "reverse_gates_applied",
            "reason": f"CHSH violation failed (S={s_parameter:.3f} ≤ 2.0)",
            "s_parameter": s_parameter,
            "phase_applied": self.REVERSE_PHASE,
            "transform": transform,
            "modified_correlations": modified_correlations,
            "eve_info_reduction": f"{(1 - abs(math.cos(phase_rad))) * 100:.1f}%"
        }
    
    def get_reverse_circuit(self, n_qubits: int) -> Dict:
        """
        Generate reverse gate circuit for visualization.
        
        Args:
            n_qubits: Number of qubits in the system
            
        Returns:
            Circuit JSON for frontend rendering
        """
        gates = []
        
        for i in range(n_qubits):
            gates.append({
                "type": "S",
                "targets": [i],
                "section": "reverse",
                "label": "Phase shift"
            })
            gates.append({
                "type": "Z",
                "targets": [i],
                "section": "reverse",
                "label": "Flip"
            })
            gates.append({
                "type": "Sdg",
                "targets": [i],
                "section": "reverse",
                "label": "Inverse phase"
            })
        
        return {
            "n_qubits": n_qubits,
            "gates": gates,
            "depth": 3,
            "metadata": {
                "type": "reverse_gates",
                "phase": self.REVERSE_PHASE,
                "purpose": "Anti-eavesdropping"
            }
        }
    
    def calculate_eve_information_loss(
        self,
        original_s: float,
        modified_s: float
    ) -> Dict:
        """
        Calculate how much information Eve loses after reverse gates.
        
        Args:
            original_s: S-parameter before reverse gates
            modified_s: S-parameter after reverse gates
            
        Returns:
            Information loss metrics
        """
        # If original S was already secure, Eve had no info
        if original_s > 2.0:
            return {
                "eve_initial_info": 0.0,
                "eve_final_info": 0.0,
                "information_destroyed": 0.0,
                "effectiveness": "N/A - No Eve detected"
            }
        
        # Estimate Eve's initial information based on S degradation
        # Maximum info when S = 0, no info when S = 2.828
        max_s = 2.828
        initial_info = max(0, 1 - (original_s / max_s))
        
        # After reverse gates, Eve's info is further reduced
        phase_factor = abs(math.cos(math.radians(self.REVERSE_PHASE)))
        final_info = initial_info * phase_factor
        
        info_destroyed = initial_info - final_info
        effectiveness = (info_destroyed / initial_info * 100) if initial_info > 0 else 0
        
        return {
            "eve_initial_info": round(initial_info * 100, 1),
            "eve_final_info": round(final_info * 100, 1),
            "information_destroyed": round(info_destroyed * 100, 1),
            "effectiveness": f"{effectiveness:.1f}%"
        }
