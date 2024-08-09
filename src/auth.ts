import { auth as firebaseAuth, googleProvider, facebookProvider } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  AuthError,
  UserCredential
} from 'firebase/auth'

// Register user with email and password
export const registerWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential['user']> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

// Login user with email and password
export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential['user']> => {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error logging in user:', error)
    throw error
  }
}

// Social Media Login - Google
export const loginWithGoogle = async (): Promise<UserCredential['user']> => {
  try {
    await preventMultiplePopups()
    const userCredential = await signInWithPopup(firebaseAuth, googleProvider)
    return userCredential.user
  } catch (error) {
    await handlePopupError(error, googleProvider)
    throw error
  }
}

// Social Media Login - Facebook
export const loginWithFacebook = async (): Promise<UserCredential['user']> => {
  try {
    await preventMultiplePopups()
    const userCredential = await signInWithPopup(firebaseAuth, facebookProvider)
    return userCredential.user
  } catch (error) {
    await handlePopupError(error, facebookProvider)
    throw error
  }
}

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await signOut(firebaseAuth)
  } catch (error) {
    console.error('Error logging out user:', error)
    throw error
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return firebaseAuth.currentUser !== null
}

// Get current user
export const getCurrentUser = () => {
  return firebaseAuth.currentUser
}

// Prevent multiple popups from being opened simultaneously
const preventMultiplePopups = (): void => {
  if (firebaseAuth.currentUser) {
    throw new Error('A user is already authenticated.')
  }
}

// Handle errors during popup-based authentication
const handlePopupError = async (
  error: unknown,
  provider: GoogleAuthProvider | FacebookAuthProvider
): Promise<void> => {
  const err = error as AuthError

  if (err.code === 'auth/account-exists-with-different-credential') {
    const email = err.customData?.email

    if (email) {
      // Fetch sign-in methods for this email
      const signInMethods = await fetchSignInMethodsForEmail(firebaseAuth, email)

      if (signInMethods.includes(EmailAuthProvider.PROVIDER_ID)) {
        // User already has an account with email/password
        const password = prompt(
          `An account already exists with this email. Please enter your password for ${email}:`
        )

        if (password) {
          try {
            const credential = EmailAuthProvider.credential(email, password)
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
            let oauthCredential

            if (provider instanceof GoogleAuthProvider) {
              oauthCredential = GoogleAuthProvider.credentialFromError(err)
            } else if (provider instanceof FacebookAuthProvider) {
              oauthCredential = FacebookAuthProvider.credentialFromError(err)
            }

            if (oauthCredential) {
              await linkWithCredential(userCredential.user, oauthCredential)
            }

            alert(
              'Your social media account has been successfully linked to your existing account.'
            )
          } catch (linkError) {
            console.error('Error linking credentials:', linkError)
            alert('Failed to link accounts. Please try again.')
          }
        }
      } else {
        // Inform the user that they need to sign in with the existing method
        alert(
          `An account already exists with this email using the ${signInMethods[0]} method. Please sign in using that method.`
        )
      }
    }
  } else {
    console.error('Error during popup-based authentication:', err)
    alert('An error occurred during authentication. Please try again.')
  }
}
