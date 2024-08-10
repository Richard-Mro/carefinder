import { auth as firebaseAuth, googleProvider, facebookProvider } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth'

// Register user with email and password
export const registerWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

// Login user with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Error logging in user:', error)
    throw error
  }
}

// Social Media Login - Google (Redirect)
export const loginWithGoogle = async () => {
  try {
    await signInWithRedirect(firebaseAuth, googleProvider)
  } catch (error) {
    console.error('Error during Google login redirect:', error)
    throw error
  }
}

// Social Media Login - Facebook (Redirect)
export const loginWithFacebook = async () => {
  try {
    await signInWithRedirect(firebaseAuth, facebookProvider)
  } catch (error) {
    console.log('Error during Facebook login redirect:', error)
    throw error
  }
}

// Handle Redirect Result after returning to app
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(firebaseAuth)
    if (result && result.user) {
      return result.user
    } else {
      throw new Error('No user found in the redirect result.')
    }
  } catch (error) {
    await handleRedirectError(error)
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

// Handle errors during redirect-based authentication
const handleRedirectError = async (error) => {
  if (error.message.includes('auth/account-exists-with-different-credential')) {
    const email = error.customData?.email

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

            if (googleProvider instanceof GoogleAuthProvider) {
              oauthCredential = GoogleAuthProvider.credentialFromError(error)
            } else if (facebookProvider instanceof FacebookAuthProvider) {
              oauthCredential = FacebookAuthProvider.credentialFromError(error)
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
    console.error('Error during redirect-based authentication:', error)
    alert('An error occurred during authentication. Please try again.')
  }
}
