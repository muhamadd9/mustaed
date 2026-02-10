import { jest } from '@jest/globals';

const { getAllUsers } = await import('../src/services/user/user.service.js');

describe('User Service - getAllUsers basic shape', () => {
    it('is a function', () => {
        expect(typeof getAllUsers).toBe('function');
    });

    it('can be called with minimal req/res/next without throwing synchronously', async () => {
        const req = {
            query: {},
            user: { id: 'admin123' },
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await expect(getAllUsers(req, res, next)).resolves.not.toThrow();
    });
});
