import { jest } from '@jest/globals';

const { getStats } = await import('../src/services/dashboard/dashboard.service.js');

describe('Dashboard Service - getStats basic shape', () => {
    it('is a function', () => {
        expect(typeof getStats).toBe('function');
    });

    it('can be called with minimal req/res/next without throwing synchronously', async () => {
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await expect(getStats(req, res, next)).resolves.not.toThrow();
    });
});
