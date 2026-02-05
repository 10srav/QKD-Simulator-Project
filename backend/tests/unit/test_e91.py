"""
Unit tests for E91 protocol modules.
"""
import math
import pytest

from app.protocols.e91.chsh_validator import CHSHValidator
from app.protocols.e91.entanglement import EntanglementGenerator


class TestCHSHValidator:
    def test_classical_bound(self):
        validator = CHSHValidator()
        assert validator.CLASSICAL_BOUND == 2.0

    def test_quantum_max(self):
        validator = CHSHValidator()
        assert validator.QUANTUM_MAX == pytest.approx(2.828, abs=0.001)

    def test_theoretical_s_optimal_angles(self):
        validator = CHSHValidator()
        s = validator.get_theoretical_s([0, 45], [22.5, 67.5])
        assert s == pytest.approx(2.8284, abs=0.01)

    def test_theoretical_s_suboptimal_angles(self):
        validator = CHSHValidator()
        s = validator.get_theoretical_s([0, 90], [45, 135])
        # S should be exactly 2.0 for these angles
        assert s == pytest.approx(2.0, abs=0.01)

    def test_calculate_chsh_with_correlations(self):
        validator = CHSHValidator()
        correlations = {
            "(0,45)": {"alice_angle": 0, "bob_angle": 45, "correlation": -0.707},
            "(0,90)": {"alice_angle": 0, "bob_angle": 90, "correlation": 0.0},
            "(45,45)": {"alice_angle": 45, "bob_angle": 45, "correlation": -1.0},
            "(45,90)": {"alice_angle": 45, "bob_angle": 90, "correlation": -0.707},
        }
        result = validator.calculate_chsh(correlations)
        assert "s_parameter" in result
        assert "violates_classical" in result
        assert "expectation_values" in result

    def test_insufficient_angles(self):
        validator = CHSHValidator()
        correlations = {
            "(0,45)": {"alice_angle": 0, "bob_angle": 45, "correlation": -0.5},
        }
        result = validator.calculate_chsh(correlations)
        assert result["s_parameter"] == 0.0
        assert result["violates_classical"] is False

    def test_interpret_secure(self):
        validator = CHSHValidator()
        result = validator.interpret_result(2.7)
        assert result["status"] == "secure"

    def test_interpret_marginal(self):
        validator = CHSHValidator()
        result = validator.interpret_result(2.1)
        assert result["status"] == "marginal"

    def test_interpret_insecure(self):
        validator = CHSHValidator()
        result = validator.interpret_result(1.2)
        assert result["status"] == "insecure"


class TestEntanglementGenerator:
    def test_create_bell_pairs_json(self):
        gen = EntanglementGenerator(n_pairs=3)
        circuit, cj = gen.create_bell_pairs()
        assert cj["n_qubits"] == 6  # 3 pairs * 2 qubits each
        assert cj["metadata"]["protocol"] == "E91"
        assert cj["metadata"]["n_pairs"] == 3

    def test_extract_keys_matching_angles(self):
        gen = EntanglementGenerator(n_pairs=2)
        correlations = {
            "(45,45)": {
                "alice_angle": 45,
                "bob_angle": 45,
                "correlation": -1.0,
                "counts": {"0000": 512, "1111": 512},
                "shots": 1024,
            }
        }
        alice_key, bob_key = gen.extract_keys(
            correlations, [45, 90], [45, 90]
        )
        assert len(alice_key) > 0
        assert len(alice_key) == len(bob_key)

    def test_mock_correlations(self):
        gen = EntanglementGenerator(n_pairs=3)
        corr = gen._mock_correlations([0, 45, 90], [45, 90, 135])
        assert len(corr) == 9  # 3 * 3 combinations
        for key, data in corr.items():
            assert "correlation" in data
            assert -1.0 <= data["correlation"] <= 1.0
