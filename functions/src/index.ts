import { onRequest } from 'firebase-functions/v1/https'
import * as functions from 'firebase-functions'
import * as logger from 'firebase-functions/logger'

export const getFirebaseConfig = onRequest(
  (request: functions.Request, response: functions.Response) => {
    response.json({
      apiKey: functions.config().custom.firebase.api_key,
      authDomain: functions.config().custom.firebase.auth_domain,
      projectId: functions.config().custom.firebase.project_id,
      databaseURL: functions.config().custom.firebase.database_url,
      storageBucket: functions.config().custom.firebase.storage_bucket,
      messagingSenderId: functions.config().custom.firebase.messaging_sender_id,
      appId: functions.config().custom.firebase.app_id,
      measurementId: functions.config().custom.firebase.measurement_id,
      googleMapsApiKey: functions.config().custom.google.maps_api_key
    })
  }
)

export const helloWorld = onRequest((request: functions.Request, response: functions.Response) => {
  logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})
