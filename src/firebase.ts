import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import * as dotenv from 'dotenv'
dotenv.config()


// Use process.env to access environment variables
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

let app: ReturnType<typeof initializeApp> | undefined
let db: ReturnType<typeof getFirestore> | undefined
let auth: Auth | undefined

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }

  // Ensure app is initialized before getting Firestore and Auth
  if (app) {
    db = getFirestore(app)
    auth = getAuth(app)
  }
}

initializeFirebase()

export { app, db, auth }
