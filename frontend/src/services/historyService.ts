/**
 * History API Service
 * Client for simulation history CRUD and comparison endpoints.
 */
import { api } from './api';

export interface HistoryItem {
    id: string;
    protocol: string;
    created_at: string;
    is_secure: boolean;
    eve_attack: boolean;
    eve_detected: boolean;
    qber: number | null;
    s_parameter: number | null;
    key_efficiency: number | null;
    key_match_rate: number | null;
    sifted_key_length: number;
    execution_time_ms: number;
    label: string | null;
}

export interface HistoryListResponse {
    items: HistoryItem[];
    total: number;
    limit: number;
    offset: number;
}

export interface HistoryDetail extends HistoryItem {
    config: Record<string, unknown>;
    full_result: Record<string, unknown>;
}

export interface CompareResponse {
    simulation_1: Record<string, unknown>;
    simulation_2: Record<string, unknown>;
    deltas: Record<string, number>;
}

export interface HistoryFilters {
    protocol?: string;
    eve_attack?: boolean;
    is_secure?: boolean;
    limit?: number;
    offset?: number;
}

export const historyService = {
    async list(filters: HistoryFilters = {}): Promise<HistoryListResponse> {
        const params = new URLSearchParams();
        if (filters.protocol) params.set('protocol', filters.protocol);
        if (filters.eve_attack !== undefined) params.set('eve_attack', String(filters.eve_attack));
        if (filters.is_secure !== undefined) params.set('is_secure', String(filters.is_secure));
        if (filters.limit) params.set('limit', String(filters.limit));
        if (filters.offset) params.set('offset', String(filters.offset));

        const { data } = await api.get(`/history?${params.toString()}`);
        return data;
    },

    async getDetail(id: string): Promise<HistoryDetail> {
        const { data } = await api.get(`/history/${id}`);
        return data;
    },

    async updateLabel(id: string, label: string): Promise<void> {
        await api.patch(`/history/${id}`, { label });
    },

    async remove(id: string): Promise<void> {
        await api.delete(`/history/${id}`);
    },

    async compare(id1: string, id2: string): Promise<CompareResponse> {
        const { data } = await api.get(`/history/compare/${id1}/${id2}`);
        return data;
    },
};
