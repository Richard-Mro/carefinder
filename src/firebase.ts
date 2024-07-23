import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

let app
let db
let auth: Auth

async function initializeFirebase() {
  const response = await fetch('/getFirebaseConfig')
  const firebaseConfig = await response.json()

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app)
  auth = getAuth(app)
}

initializeFirebase()

export { app, db, auth }
