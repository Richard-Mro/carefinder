import { openDB } from 'idb'

const DB_NAME = 'carefinderDB'
const STORE_NAME = 'hospitals'

/**
 * Initializes the database and creates an object store if it doesn't exist.
 */
async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' }) // Ensure hospitals are stored with unique IDs
      }
    }
  })
}

/**
 * Converts Firestore Timestamps and removes non-serializable properties.
 * @param hospital - A single hospital object
 * @returns A cleaned version of the hospital object
 */
function serializeHospitalData(hospital: any) {
  return JSON.parse(
    JSON.stringify(hospital, (key, value) => {
      // Convert Firestore Timestamp to ISO date string
      if (value && typeof value.toDate === 'function') {
        return value.toDate().toISOString()
      }
      return value
    })
  )
}

/**
 * Saves a list of hospitals to IndexedDB.
 * @param hospitals - Array of hospital objects to be stored.
 */
export async function saveHospitals(hospitals: any[]) {
  const db = await initDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  try {
    for (const hospital of hospitals) {
      const cleanData = serializeHospitalData(hospital) // Ensure data is serializable
      await store.put(cleanData) // Store each hospital with its ID as the key
    }
    await tx.done
    console.log('Hospitals successfully saved to IndexedDB')
  } catch (error) {
    console.error('Error saving hospitals to IndexedDB:', error)
  }
}

/**
 * Retrieves all stored hospitals from IndexedDB.
 * @returns Promise resolving to an array of hospital objects.
 */
export async function getCachedHospitals() {
  const db = await initDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)

  try {
    const hospitals = await store.getAll()
    console.log('Retrieved hospitals from IndexedDB:', hospitals)
    return hospitals || [] // Return empty array if no data is available
  } catch (error) {
    console.error('Error retrieving hospitals from IndexedDB:', error)
    return [] // Ensure it never returns undefined
  }
}

/**
 * Clears all hospitals from IndexedDB.
 */
export async function clearCachedHospitals() {
  const db = await initDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  try {
    await store.clear()
    console.log('Hospitals cache cleared successfully')
  } catch (error) {
    console.error('Error clearing hospital cache:', error)
  }
}
