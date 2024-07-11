"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_1 = require("firebase/auth");
const auth_2 = require("./auth");
vitest_1.vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        createUserWithEmailAndPassword: vitest_1.vi.fn(() => Promise.resolve({ user: { uid: 'testUid', email: 'test@example.com' } })),
        signInWithEmailAndPassword: vitest_1.vi.fn(() => Promise.resolve({ user: { uid: 'testUid', email: 'test@example.com' } })),
        signOut: vitest_1.vi.fn(() => Promise.resolve()),
        getAuth: vitest_1.vi.fn(() => ({ currentUser: { uid: 'testUid', email: 'test@example.com' } }))
    };
});
(0, vitest_1.describe)('Authentication Tests', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should register a new user', async () => {
        const user = await (0, auth_2.registerWithEmailAndPassword)('test@example.com', 'password123');
        (0, vitest_1.expect)(auth_1.createUserWithEmailAndPassword).toHaveBeenCalledWith(vitest_1.expect.anything(), 'test@example.com', 'password123');
        (0, vitest_1.expect)(user).toEqual({ uid: 'testUid', email: 'test@example.com' });
    });
    (0, vitest_1.it)('should login an existing user', async () => {
        const user = await (0, auth_2.loginWithEmailAndPassword)('test@example.com', 'password123');
        (0, vitest_1.expect)(auth_1.signInWithEmailAndPassword).toHaveBeenCalledWith(vitest_1.expect.anything(), 'test@example.com', 'password123');
        (0, vitest_1.expect)(user).toEqual({ uid: 'testUid', email: 'test@example.com' });
    });
    (0, vitest_1.it)('should logout the current user', async () => {
        await (0, auth_2.logout)();
        (0, vitest_1.expect)(auth_1.signOut).toHaveBeenCalled();
    });
    (0, vitest_1.it)('should check if user is authenticated', () => {
        const auth = (0, auth_1.getAuth)();
        (0, vitest_1.expect)(auth.currentUser).toEqual({ uid: 'testUid', email: 'test@example.com' });
    });
});
