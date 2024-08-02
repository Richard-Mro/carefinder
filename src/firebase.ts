import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import dotenv from 'dotenv'

// Load environment variables from the .env file
dotenv.config()

const firebaseConfig = {
  apiKey: process.env.VITE_APP_FIREBASE_API_KEY!,
  authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID!,
  databaseURL: process.env.VITE_APP_FIREBASE_DATABASE_URL!,
  storageBucket: process.env.VITE_APP_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.VITE_FIREBASE_APP_ID!,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID!,
  googleMapsApiKey: process.env.VITE_APP_GOOGLE_MAPS_API_KEY!
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { app, db, auth }
