// Check if running in the browser or Node.js
const isBrowser = typeof window !== 'undefined'

let firebaseConfig

if (isBrowser) {
  // Browser environment
  firebaseConfig = {
    apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
    databaseURL: import.meta.env.VITE_APP_FIREBASE_DATABASE_URL,
    storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
  }
} else {
  // Node.js environment
  const { config } = await import('dotenv')
  config() // Load environment variables from .env file

  firebaseConfig = {
    apiKey: process.env.VITE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID,
    databaseURL: process.env.VITE_APP_FIREBASE_DATABASE_URL,
    storageBucket: process.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    googleMapsApiKey: process.env.VITE_APP_GOOGLE_MAPS_API_KEY
  }
}

import { initializeApp, getApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)

export { app, db, auth }
