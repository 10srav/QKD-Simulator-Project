/**
 * Mock API responses for testing.
 */
import type { BB84Result, E91Result } from '../types';

export const mockBB84Result: BB84Result = {
    circuit_json: {
        n_qubits: 4,
        n_classical: 4,
        gates: [],
        depth: 5,
        metadata: { protocol: 'BB84' },
    },
    circuit_depth: 5,
    alice_bits: [0, 1, 0, 1],
    alice_bases: ['Z', 'X', 'Z', 'X'],
    bob_bases: ['Z', 'Z', 'Z', 'X'],
    bob_measurements: [0, 1, 0, 1],
    sifted_alice_key: [0, 0, 1],
    sifted_bob_key: [0, 0, 1],
    matching_indices: [0, 2, 3],
    eve_detected: false,
    eve_intercepted_indices: null,
    eve_bases: null,
    eve_measurements: null,
    qber: 0.0,
    is_secure: true,
    information_leakage: 0,
    key_efficiency: 0.75,
    execution_time_ms: 42,
    shots_used: 1024,
};

export const mockE91Result: E91Result = {
    circuit_json: {
        n_qubits: 6,
        n_classical: 6,
        gates: [],
        depth: 3,
        metadata: { protocol: 'E91' },
    },
    circuit_depth: 3,
    alice_angles_used: [0, 45, 90],
    bob_angles_used: [45, 90, 135],
    correlations: {},
    chsh_result: {
        s_parameter: 2.72,
        classical_bound: 2.0,
        quantum_max: 2.828,
        violates_classical: true,
        expectation_values: {},
    },
    is_secure: true,
    eve_detected: false,
    sifted_alice_key: [0, 1, 0],
    sifted_bob_key: [0, 1, 0],
    key_match_rate: 100,
    execution_time_ms: 150,
    shots_per_combination: 1024,
};
