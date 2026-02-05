/**
 * Tests for history service API client.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { historyService } from './historyService';
import { api } from './api';

vi.mock('./api', () => ({
    api: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('historyService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list history with no filters', async () => {
        const mockResp = { data: { items: [], total: 0, limit: 20, offset: 0 } };
        vi.mocked(api.get).mockResolvedValue(mockResp);

        const result = await historyService.list();
        expect(result.items).toEqual([]);
        expect(api.get).toHaveBeenCalledWith('/history?');
    });

    it('should list history with protocol filter', async () => {
        const mockResp = { data: { items: [], total: 0, limit: 20, offset: 0 } };
        vi.mocked(api.get).mockResolvedValue(mockResp);

        await historyService.list({ protocol: 'BB84' });
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('protocol=BB84'));
    });

    it('should get detail by id', async () => {
        const mockResp = { data: { id: '123', protocol: 'BB84' } };
        vi.mocked(api.get).mockResolvedValue(mockResp);

        const result = await historyService.getDetail('123');
        expect(result.id).toBe('123');
        expect(api.get).toHaveBeenCalledWith('/history/123');
    });

    it('should update label', async () => {
        vi.mocked(api.patch).mockResolvedValue({});
        await historyService.updateLabel('abc', 'my label');
        expect(api.patch).toHaveBeenCalledWith('/history/abc', { label: 'my label' });
    });

    it('should delete by id', async () => {
        vi.mocked(api.delete).mockResolvedValue({});
        await historyService.remove('xyz');
        expect(api.delete).toHaveBeenCalledWith('/history/xyz');
    });

    it('should compare two simulations', async () => {
        const mockResp = {
            data: { simulation_1: {}, simulation_2: {}, deltas: { qber: 1.5 } },
        };
        vi.mocked(api.get).mockResolvedValue(mockResp);

        const result = await historyService.compare('a', 'b');
        expect(result.deltas.qber).toBe(1.5);
        expect(api.get).toHaveBeenCalledWith('/history/compare/a/b');
    });
});
