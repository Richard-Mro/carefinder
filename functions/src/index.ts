import { onRequest } from 'firebase-functions/v1/https'
import * as functions from 'firebase-functions'
import * as logger from 'firebase-functions/logger'

// Endpoint to expose Firebase configuration
export const getFirebaseConfig = onRequest(
  (request: functions.Request, response: functions.Response) => {
    response.json({
      apiKey: process.env.VITE_APP_FIREBASE_API_KEY,
      authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID,
      databaseURL: process.env.VITE_APP_FIREBASE_DATABASE_URL,
      storageBucket: process.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
      googleMapsApiKey: process.env.VITE_APP_GOOGLE_MAPS_API_KEY
    })
  }
)

// Example function
export const helloWorld = onRequest((request: functions.Request, response: functions.Response) => {
  logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})
