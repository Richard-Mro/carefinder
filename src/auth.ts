// auth.ts

import { auth as firebaseAuth } from './firebase' // Import your initialized Firebase auth
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'

// Register user with email and password
export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    const user = userCredential.user
    return user
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

// Login user with email and password
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    const user = userCredential.user
    return user
  } catch (error) {
    console.error('Error logging in user:', error)
    throw error
  }
}

// Logout user
export const logout = async () => {
  try {
    await signOut(firebaseAuth)
  } catch (error) {
    console.error('Error logging out user:', error)
    throw error
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return firebaseAuth.currentUser !== null
}

// Get current user
export const getCurrentUser = () => {
  return firebaseAuth.currentUser
}
