/**
 * BB84 Protocol API Service
 */
import api from './api';
import type { BB84Config, BB84Result, BB84Preset } from '../types';

export const bb84Service = {
    /**
     * Run BB84 simulation with given configuration
     */
    async simulate(config: BB84Config): Promise<BB84Result> {
        const response = await api.post<BB84Result>('/bb84/simulate', config);
        return response.data;
    },

    /**
     * Get available preset configurations
     */
    async getPresets(): Promise<BB84Preset[]> {
        const response = await api.get<{ presets: BB84Preset[] }>('/bb84/presets');
        return response.data.presets;
    },
};

export default bb84Service;
