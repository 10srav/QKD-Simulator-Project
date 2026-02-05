/**
 * TypeScript type definitions for QKD Simulator
 */

// ============ Enums ============

export type Basis = 'Z' | 'X' | 'D';
export type ProtocolType = 'BB84' | 'E91';
export type SimulationStatus = 'idle' | 'running' | 'completed' | 'error';
export type SecurityStatus = 'secure' | 'insecure' | 'warning' | 'unknown';

// ============ BB84 Types ============

export interface BB84Config {
    n_qubits: number;
    bases: Basis[];
    eve_attack: boolean;
    eve_intercept_ratio: number;
    shots: number;
}

export interface BB84Result {
    // Circuit Information
    circuit_json: CircuitJSON;
    circuit_depth: number;

    // Key Information
    alice_bits: number[];
    alice_bases: string[];
    bob_bases: string[];
    bob_measurements: number[];

    // Sifted Keys
    sifted_alice_key: number[];
    sifted_bob_key: number[];
    matching_indices: number[];

    // Eve Information
    eve_detected: boolean;
    eve_intercepted_indices: number[] | null;
    eve_bases: string[] | null;
    eve_measurements: number[] | null;

    // Security Metrics
    qber: number;
    is_secure: boolean;
    information_leakage: number;
    key_efficiency: number;

    // Execution Metadata
    execution_time_ms: number;
    shots_used: number;
}

export interface BB84Preset {
    name: string;
    description: string;
    config: Partial<BB84Config>;
}

// ============ E91 Types ============

export interface E91Config {
    n_pairs: number;
    alice_angles: number[];
    bob_angles: number[];
    eve_attack: boolean;
    shots: number;
    noise_level: number;
}

export interface CHSHResult {
    s_parameter: number;
    classical_bound: number;
    quantum_max: number;
    violates_classical: boolean;
    expectation_values: Record<string, number>;
}

export interface E91Result {
    // Circuit Information
    circuit_json: CircuitJSON;
    circuit_depth: number;

    // Measurement Results
    alice_angles_used: number[];
    bob_angles_used: number[];
    correlations: Record<string, CorrelationData>;

    // CHSH Analysis
    chsh_result: CHSHResult;

    // Security
    is_secure: boolean;
    eve_detected: boolean;

    // Generated Keys
    sifted_alice_key: number[];
    sifted_bob_key: number[];
    key_match_rate: number;

    // Execution Metadata
    execution_time_ms: number;
    shots_per_combination: number;
}

export interface CorrelationData {
    alice_angle: number;
    bob_angle: number;
    correlation: number;
    counts: Record<string, number>;
    shots: number;
}

// ============ Circuit Visualization Types ============

export interface CircuitJSON {
    n_qubits: number;
    n_classical: number;
    gates: CircuitGate[];
    depth: number;
    metadata: Record<string, unknown>;
}

export interface CircuitGate {
    type: string;
    targets: number[];
    section: 'alice' | 'bob' | 'eve' | 'entanglement' | 'measurement' | 'transmission' | 'reverse';
    label?: string;
    controls?: number[];
}

// ============ UI State Types ============

export interface SimulationState {
    protocol: ProtocolType | null;
    status: SimulationStatus;
    config: BB84Config | E91Config | null;
    result: BB84Result | E91Result | null;
    error: string | null;
    startTime: number | null;
}

export interface UIState {
    darkMode: boolean;
    sidebarOpen: boolean;
    activeTab: string;
}

// ============ API Types ============

export interface ApiError {
    error: string;
    detail?: string;
    error_code?: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}

// ============ Chart Data Types ============

export interface QBERDataPoint {
    run: number;
    qber: number;
    threshold: number;
    secure: boolean;
}

export interface CHSHDataPoint {
    angleCombo: string;
    correlation: number;
    aliceAngle: number;
    bobAngle: number;
}

export interface KeyComparisonData {
    index: number;
    aliceBit: number;
    bobBit: number;
    match: boolean;
}
