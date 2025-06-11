import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { Hospital } from './types'
import { saveHospitals, getCachedHospitals } from '../utils/indexedDB'

export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    if (!navigator.onLine) {
      console.log('Offline: Fetching hospitals from IndexedDB')
      return await getCachedHospitals()
    }

    if (!db) {
      throw new Error('Firestore database is not initialized')
    }

    const hospitalsCollection = collection(db, 'hospitals')
    const snapshot = await getDocs(hospitalsCollection)

    const hospitalsList: Hospital[] = snapshot.docs.map((doc) => {
      const data = doc.data()

      // Ensure all required properties exist
      const hospitalData: Hospital = {
        id: doc.id,
        name: data.name || 'Unknown',
        address: data.address || 'Unknown',
        phone: data.phone || 'Not Provided',
        website: data.website || 'Not Available',
        markdown: data.markdown || 'N/A',
        location: {
          latitude: data.location?.latitude ?? 0,
          longitude: data.location?.longitude ?? 0
        }
      }

      return hospitalData
    })

    // Save to IndexedDB for offline access
    await saveHospitals(hospitalsList)

    return hospitalsList
  } catch (error: any) {
    console.error('Error fetching hospitals:', error)

    // Return cached data if an error occurs
    return await getCachedHospitals()
  }
}
