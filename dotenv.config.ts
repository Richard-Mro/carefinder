import dotenv from 'dotenv'
import { resolve } from 'path'

// Specify the path to your .env file
const envFilePath = resolve(__dirname, '..', '.env')
dotenv.config({ path: envFilePath })

const firebaseConfig = {
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

export default firebaseConfig
