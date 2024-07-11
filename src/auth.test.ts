import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth'
import { registerWithEmailAndPassword, loginWithEmailAndPassword, logout } from './auth'

vi.mock('firebase/auth', async (importOriginal: () => Promise<typeof import('firebase/auth')>) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createUserWithEmailAndPassword: vi.fn(() =>
      Promise.resolve({ user: { uid: 'testUid', email: 'test@example.com' } })
    ),
    signInWithEmailAndPassword: vi.fn(() =>
      Promise.resolve({ user: { uid: 'testUid', email: 'test@example.com' } })
    ),
    signOut: vi.fn(() => Promise.resolve()),
    getAuth: vi.fn(() => ({ currentUser: { uid: 'testUid', email: 'test@example.com' } }))
  }
})

describe('Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register a new user', async () => {
    const user = await registerWithEmailAndPassword('test@example.com', 'password123')
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    )
    expect(user).toEqual({ uid: 'testUid', email: 'test@example.com' })
  })

  it('should login an existing user', async () => {
    const user = await loginWithEmailAndPassword('test@example.com', 'password123')
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    )
    expect(user).toEqual({ uid: 'testUid', email: 'test@example.com' })
  })

  it('should logout the current user', async () => {
    await logout()
    expect(signOut).toHaveBeenCalled()
  })

  it('should check if user is authenticated', () => {
    const auth = getAuth()
    expect(auth.currentUser).toEqual({ uid: 'testUid', email: 'test@example.com' })
  })
})
