"""
Unit tests for BB84 protocol modules.
"""
import random
import pytest

from app.protocols.bb84.circuit_builder import BB84CircuitBuilder
from app.protocols.bb84.key_sifting import KeySifter
from app.protocols.bb84.eve_attack import EveAttacker
from app.analysis.qber_calculator import QBERCalculator


class TestBB84CircuitBuilder:
    def test_generate_alice_data_length(self):
        builder = BB84CircuitBuilder(n_qubits=9, bases=["Z", "X"])
        bits, bases = builder.generate_alice_data()
        assert len(bits) == 9
        assert len(bases) == 9

    def test_generate_alice_data_values(self):
        builder = BB84CircuitBuilder(n_qubits=20, bases=["Z", "X", "D"])
        bits, bases = builder.generate_alice_data()
        assert all(b in (0, 1) for b in bits)
        assert all(b in ("Z", "X", "D") for b in bases)

    def test_generate_bob_bases_length(self):
        builder = BB84CircuitBuilder(n_qubits=12, bases=["Z", "X"])
        bob_bases = builder.generate_bob_bases()
        assert len(bob_bases) == 12
        assert all(b in ("Z", "X") for b in bob_bases)

    def test_build_circuit_returns_json(self):
        builder = BB84CircuitBuilder(n_qubits=4, bases=["Z", "X"])
        alice_bits = [0, 1, 0, 1]
        alice_bases = ["Z", "X", "Z", "X"]
        bob_bases = ["Z", "Z", "X", "X"]
        circuit, cj = builder.build_circuit(alice_bits, alice_bases, bob_bases)
        assert cj["n_qubits"] == 4
        assert cj["n_classical"] == 4
        assert len(cj["gates"]) > 0
        assert cj["metadata"]["protocol"] == "BB84"


class TestKeySifting:
    def test_same_bases_all_match(self):
        sifter = KeySifter()
        result = sifter.sift_keys(
            alice_bits=[0, 1, 0, 1],
            alice_bases=["Z", "X", "Z", "X"],
            bob_measurements=[0, 1, 0, 1],
            bob_bases=["Z", "X", "Z", "X"],
        )
        assert result["alice_key"] == [0, 1, 0, 1]
        assert result["bob_key"] == [0, 1, 0, 1]
        assert result["matching_indices"] == [0, 1, 2, 3]
        assert result["efficiency"] == 1.0

    def test_no_bases_match(self):
        sifter = KeySifter()
        result = sifter.sift_keys(
            alice_bits=[0, 1],
            alice_bases=["Z", "Z"],
            bob_measurements=[0, 1],
            bob_bases=["X", "X"],
        )
        assert result["alice_key"] == []
        assert result["bob_key"] == []
        assert result["efficiency"] == 0.0

    def test_partial_match(self):
        sifter = KeySifter()
        result = sifter.sift_keys(
            alice_bits=[0, 1, 1, 0],
            alice_bases=["Z", "X", "Z", "X"],
            bob_measurements=[0, 1, 1, 0],
            bob_bases=["Z", "Z", "Z", "Z"],
        )
        # Only indices 0, 2 match (both Z)
        assert result["matching_indices"] == [0, 2]
        assert result["efficiency"] == 0.5

    def test_compare_keys_match(self):
        sifter = KeySifter()
        result = sifter.compare_keys([0, 1, 0], [0, 1, 0])
        assert result["match"] is True
        assert result["match_rate"] == 1.0

    def test_compare_keys_mismatch(self):
        sifter = KeySifter()
        result = sifter.compare_keys([0, 1, 0, 1], [0, 0, 0, 1])
        assert result["match"] is False
        assert result["mismatches"] == 1

    def test_compare_keys_different_length(self):
        sifter = KeySifter()
        result = sifter.compare_keys([0, 1], [0, 1, 0])
        assert result["match"] is False
        assert "error" in result


class TestEveAttacker:
    def test_intercept_modifies_measurements(self):
        random.seed(42)
        attacker = EveAttacker(n_qubits=8, intercept_ratio=1.0, bases=["Z", "X"])
        result = attacker.intercept(
            alice_bits=[0, 1, 0, 1, 0, 1, 0, 1],
            alice_bases=["Z", "X", "Z", "X", "Z", "X", "Z", "X"],
            bob_bases=["Z", "X", "Z", "X", "Z", "X", "Z", "X"],
            bob_measurements=[0, 1, 0, 1, 0, 1, 0, 1],
        )
        assert "intercepted_indices" in result
        assert len(result["intercepted_indices"]) == 8  # 100% intercept
        assert "eve_bases" in result
        assert "eve_measurements" in result
        assert "modified_bob_measurements" in result

    def test_zero_intercept_ratio(self):
        attacker = EveAttacker(n_qubits=4, intercept_ratio=0.0)
        result = attacker.intercept(
            alice_bits=[0, 1, 0, 1],
            alice_bases=["Z", "X", "Z", "X"],
            bob_bases=["Z", "X", "Z", "X"],
            bob_measurements=[0, 1, 0, 1],
        )
        assert len(result["intercepted_indices"]) == 0
        assert result["modified_bob_measurements"] == [0, 1, 0, 1]

    def test_calculate_expected_error_two_bases(self):
        attacker = EveAttacker(n_qubits=9, intercept_ratio=1.0, bases=["Z", "X"])
        error = attacker.calculate_expected_error(["Z"] * 9)
        assert error == pytest.approx(25.0, abs=0.1)

    def test_calculate_expected_error_three_bases(self):
        attacker = EveAttacker(n_qubits=9, intercept_ratio=1.0, bases=["Z", "X", "D"])
        error = attacker.calculate_expected_error(["Z"] * 9)
        assert error == pytest.approx(33.33, abs=0.1)


class TestQBERCalculator:
    def test_zero_qber(self):
        calc = QBERCalculator()
        result = calc.calculate([0, 1, 0, 1], [0, 1, 0, 1])
        assert result["qber"] == 0.0
        assert result["is_secure"] is True

    def test_high_qber(self):
        calc = QBERCalculator()
        result = calc.calculate([0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [1, 1, 1, 1, 1, 0, 0, 0, 0, 0])
        assert result["qber"] == 50.0
        assert result["is_secure"] is False

    def test_threshold_boundary(self):
        calc = QBERCalculator()
        assert calc.SECURITY_THRESHOLD == 8.5

    def test_empty_keys(self):
        calc = QBERCalculator()
        result = calc.calculate([], [])
        assert result["qber"] == 0.0
        assert result["is_secure"] is True

    def test_information_leakage(self):
        calc = QBERCalculator()
        leak = calc.calculate_information_leakage(5, 10)
        assert leak == 50.0

    def test_information_leakage_zero(self):
        calc = QBERCalculator()
        leak = calc.calculate_information_leakage(0, 0)
        assert leak == 0.0

    def test_security_recommendation_excellent(self):
        calc = QBERCalculator()
        rec = calc.get_security_recommendation(2.0)
        assert rec["status"] == "excellent"

    def test_security_recommendation_critical(self):
        calc = QBERCalculator()
        rec = calc.get_security_recommendation(20.0)
        assert rec["status"] == "critical"

    def test_estimate_secure_key_length(self):
        calc = QBERCalculator()
        length = calc.estimate_secure_key_length(100, 0.0)
        assert length == 100

    def test_estimate_secure_key_length_above_threshold(self):
        calc = QBERCalculator()
        length = calc.estimate_secure_key_length(100, 10.0)
        assert length == 0
