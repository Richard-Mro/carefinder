import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
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

let app: ReturnType<typeof initializeApp> | undefined
let db: ReturnType<typeof getFirestore> | undefined
let auth: Auth | undefined

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }

  db = getFirestore(app)
  auth = getAuth(app)
}

initializeFirebase()

export { app, db, auth }
