/**
 * Tests for Zustand simulation store.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useSimulationStore, useUIStore } from './index';

describe('useSimulationStore', () => {
    beforeEach(() => {
        useSimulationStore.getState().reset();
    });

    it('should start with idle status', () => {
        const state = useSimulationStore.getState();
        expect(state.status).toBe('idle');
        expect(state.protocol).toBeNull();
        expect(state.error).toBeNull();
    });

    it('should set protocol', () => {
        useSimulationStore.getState().setProtocol('BB84');
        expect(useSimulationStore.getState().protocol).toBe('BB84');
    });

    it('should clear error when setting protocol', () => {
        useSimulationStore.setState({ error: 'some error' });
        useSimulationStore.getState().setProtocol('E91');
        expect(useSimulationStore.getState().error).toBeNull();
    });

    it('should update BB84 config', () => {
        useSimulationStore.getState().updateBB84Config({ n_qubits: 16 });
        expect(useSimulationStore.getState().bb84Config.n_qubits).toBe(16);
        // Other fields unchanged
        expect(useSimulationStore.getState().bb84Config.shots).toBe(1024);
    });

    it('should update E91 config', () => {
        useSimulationStore.getState().updateE91Config({ n_pairs: 12, noise_level: 0.1 });
        const config = useSimulationStore.getState().e91Config;
        expect(config.n_pairs).toBe(12);
        expect(config.noise_level).toBe(0.1);
    });

    it('should reset to defaults', () => {
        useSimulationStore.getState().setProtocol('BB84');
        useSimulationStore.getState().updateBB84Config({ n_qubits: 20 });
        useSimulationStore.getState().reset();
        const state = useSimulationStore.getState();
        expect(state.protocol).toBeNull();
        expect(state.bb84Config.n_qubits).toBe(9);
        expect(state.status).toBe('idle');
    });

    it('should clear results', () => {
        useSimulationStore.setState({ status: 'completed', error: 'test' });
        useSimulationStore.getState().clearResults();
        expect(useSimulationStore.getState().status).toBe('idle');
        expect(useSimulationStore.getState().error).toBeNull();
    });

    it('should have correct BB84 defaults', () => {
        const config = useSimulationStore.getState().bb84Config;
        expect(config.n_qubits).toBe(9);
        expect(config.bases).toEqual(['Z', 'X']);
        expect(config.eve_attack).toBe(false);
        expect(config.eve_intercept_ratio).toBe(1.0);
        expect(config.shots).toBe(1024);
    });

    it('should have correct E91 defaults', () => {
        const config = useSimulationStore.getState().e91Config;
        expect(config.n_pairs).toBe(9);
        expect(config.alice_angles).toEqual([0, 45, 90]);
        expect(config.bob_angles).toEqual([45, 90, 135]);
        expect(config.eve_attack).toBe(false);
        expect(config.noise_level).toBe(0);
    });
});

describe('useUIStore', () => {
    it('should default to dark mode', () => {
        expect(useUIStore.getState().darkMode).toBe(true);
    });

    it('should toggle dark mode', () => {
        useUIStore.getState().toggleDarkMode();
        expect(useUIStore.getState().darkMode).toBe(false);
        useUIStore.getState().toggleDarkMode();
        expect(useUIStore.getState().darkMode).toBe(true);
    });

    it('should toggle sidebar', () => {
        expect(useUIStore.getState().sidebarOpen).toBe(false);
        useUIStore.getState().toggleSidebar();
        expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
});
