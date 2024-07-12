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
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
  // Add other Firebase config properties
}

export default firebaseConfig
