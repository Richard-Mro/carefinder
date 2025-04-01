import { openDB } from 'idb'

const DB_NAME = 'carefinderDB'
const STORE_NAME = 'hospitals'

export async function saveHospitals(hospitals: any[]) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  hospitals.forEach((hospital) => store.put(hospital))

  await tx.done
}

export async function getCachedHospitals() {
  const db = await openDB(DB_NAME, 1)
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return await store.getAll()
}
