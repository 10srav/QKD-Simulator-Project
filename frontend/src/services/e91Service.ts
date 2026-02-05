/**
 * E91 Protocol API Service
 */
import api from './api';
import type { E91Config, E91Result } from '../types';

export const e91Service = {
    /**
     * Run E91 simulation with given configuration
     */
    async simulate(config: E91Config): Promise<E91Result> {
        const response = await api.post<E91Result>('/e91/simulate', config);
        return response.data;
    },

    /**
     * Get detailed CHSH analysis for a simulation
     */
    async getAnalysis(simulationId: string): Promise<unknown> {
        const response = await api.get(`/e91/analyze/${simulationId}`);
        return response.data;
    },
};

export default e91Service;
