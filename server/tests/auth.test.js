import { jest } from '@jest/globals';

// Import handlers directly from controller
const { login, signup } = await import('../src/services/auth/auth.controller.js');

describe('Auth Controller basic shape', () => {
    it('exports signup and login handlers as functions', () => {
        expect(typeof signup).toBe('function');
        expect(typeof login).toBe('function');
    });

    it('signup handler accepts (req, res, next) without throwing synchronously', () => {
        const req = { body: {} };
        const res = {};
        const next = jest.fn();

        expect(() => signup(req, res, next)).not.toThrow();
    });

    it('login handler accepts (req, res, next) without throwing synchronously', () => {
        const req = { body: {} };
        const res = {};
        const next = jest.fn();

        expect(() => login(req, res, next)).not.toThrow();
    });
});
