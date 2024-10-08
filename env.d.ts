/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_FIREBASE_API_KEY: string
  readonly VITE_APP_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_APP_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_DATABASE_URL: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_APP_GOOGLE_MAPS_API_KEY: string
  // add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
