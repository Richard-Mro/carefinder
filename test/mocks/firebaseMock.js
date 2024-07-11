import { vi } from 'vitest';
// Mock Firebase Auth functions
export const mockCreateUserWithEmailAndPassword = vi.fn(() => Promise.resolve({
    user: { uid: 'test-uid', email: 'test@example.com' }
}));
export const mockSignInWithEmailAndPassword = vi.fn(() => Promise.resolve({
    user: { uid: 'test-uid', email: 'test@example.com' }
}));
export const mockSignOut = vi.fn(() => Promise.resolve());
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({
        createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
        signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
        signOut: mockSignOut
    }))
}));
