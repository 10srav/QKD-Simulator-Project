/**
 * Zustand Store for QKD Simulator
 * Global state management for simulations and UI
 */
import { create } from 'zustand';
import type {
    SimulationState,
    ProtocolType,
    BB84Config,
    E91Config,
    BB84Result,
    E91Result
} from '../types';
import { bb84Service } from '../services/bb84Service';
import { e91Service } from '../services/e91Service';

// Default configurations
const defaultBB84Config: BB84Config = {
    n_qubits: 9,
    bases: ['Z', 'X'],
    eve_attack: false,
    eve_intercept_ratio: 1.0,
    shots: 1024,
};

const defaultE91Config: E91Config = {
    n_pairs: 9,
    alice_angles: [0, 45, 90],
    bob_angles: [45, 90, 135],
    eve_attack: false,
    shots: 1024,
    noise_level: 0,
};

interface SimulationStore {
    // State
    protocol: ProtocolType | null;
    status: SimulationState['status'];
    bb84Config: BB84Config;
    e91Config: E91Config;
    bb84Result: BB84Result | null;
    e91Result: E91Result | null;
    error: string | null;

    // Actions
    setProtocol: (protocol: ProtocolType | null) => void;
    updateBB84Config: (config: Partial<BB84Config>) => void;
    updateE91Config: (config: Partial<E91Config>) => void;
    runBB84Simulation: () => Promise<void>;
    runE91Simulation: () => Promise<void>;
    reset: () => void;
    clearResults: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
    // Initial state
    protocol: null,
    status: 'idle',
    bb84Config: defaultBB84Config,
    e91Config: defaultE91Config,
    bb84Result: null,
    e91Result: null,
    error: null,

    // Actions
    setProtocol: (protocol) => set({ protocol, error: null }),

    updateBB84Config: (config) =>
        set((state) => ({
            bb84Config: { ...state.bb84Config, ...config }
        })),

    updateE91Config: (config) =>
        set((state) => ({
            e91Config: { ...state.e91Config, ...config }
        })),

    runBB84Simulation: async () => {
        const { bb84Config } = get();

        set({ status: 'running', error: null, bb84Result: null });

        try {
            const result = await bb84Service.simulate(bb84Config);
            set({ status: 'completed', bb84Result: result });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Simulation failed';
            set({ status: 'error', error: message });
        }
    },

    runE91Simulation: async () => {
        const { e91Config } = get();

        set({ status: 'running', error: null, e91Result: null });

        try {
            const result = await e91Service.simulate(e91Config);
            set({ status: 'completed', e91Result: result });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Simulation failed';
            set({ status: 'error', error: message });
        }
    },

    reset: () => set({
        protocol: null,
        status: 'idle',
        bb84Config: defaultBB84Config,
        e91Config: defaultE91Config,
        bb84Result: null,
        e91Result: null,
        error: null,
    }),

    clearResults: () => set({
        status: 'idle',
        bb84Result: null,
        e91Result: null,
        error: null,
    }),
}));

// UI Store for theme and layout
interface UIStore {
    darkMode: boolean;
    sidebarOpen: boolean;
    toggleDarkMode: () => void;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    darkMode: true, // Default to dark mode
    sidebarOpen: false,

    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
