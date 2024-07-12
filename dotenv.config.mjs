// dotenv.config.mjs
import dotenv from 'dotenv'

let firebaseConfig = {}

// Check if process is defined (Node.js environment)
if (typeof process !== 'undefined' && process.env) {
  dotenv.config()
  // Define Firebase configuration
  firebaseConfig = {
    apiKey: process.env.VITE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
    // Add other Firebase config properties
  }
} else {
  console.warn('dotenv.config.mjs: `process` is not defined. Skipping dotenv configuration.')
}

export default firebaseConfig
