import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

let app: ReturnType<typeof initializeApp> | undefined
let db: ReturnType<typeof getFirestore> | undefined
let auth: Auth | undefined

async function initializeFirebase() {
  const response = await fetch('/getFirebaseConfig')
  const firebaseConfig = await response.json()

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
