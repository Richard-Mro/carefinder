import dotenv from 'dotenv'
dotenv.config()

if (typeof process !== 'undefined') {
  dotenv.config()
} else {
  console.warn('dotenv.config.ts: `process` is not defined. Skipping dotenv configuration.')
}

const firebaseConfig = {
  apiKey: process.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: '938950238680',
  appId: '1:938950238680:web:f5c7afe07a0f9354d152ad'
  // Add other Firebase config properties
}

export default firebaseConfig
