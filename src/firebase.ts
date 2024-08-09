import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'


const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY!,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN!,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID!,
  databaseURL: import.meta.env.VITE_APP_FIREBASE_DATABASE_URL!,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: import.meta.env.VITE_FIREBASE_APP_ID!,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID!,
  googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY!
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Social Media Auth Providers
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()

export { app, db, auth, googleProvider, facebookProvider }
