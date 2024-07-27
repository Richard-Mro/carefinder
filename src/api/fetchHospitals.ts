import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { Hospital } from './types'

export const fetchHospitals = async (): Promise<Hospital[]> => {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized')
    }

    const hospitalsCollection = collection(db, 'hospitals')
    const snapshot = await getDocs(hospitalsCollection)
    const hospitalsList = snapshot.docs
      .map((doc) => {
        const data = doc.data()

        // Normalize data structure
        const hospitalData: Omit<Hospital, 'id'> = {
          name: data.name,
          vicinity: data.vicinity,
          geometry: {
            location: {
              lat: data.geometry?.location?.lat ?? data.location?.lat,
              lng: data.geometry?.location?.lng ?? data.location?.lng
            }
          },
          international_phone_number: data.international_phone_number || data.phone || 'N/A',
          email: data.email || 'N/A'
        }

        // Validate the required fields
        if (!hospitalData.name || !hospitalData.vicinity || !hospitalData.geometry.location) {
          console.error('Invalid hospital data:', data)
          return null
        }

        return {
          id: doc.id,
          ...hospitalData
        }
      })
      .filter((hospital): hospital is Hospital => hospital !== null)

    return hospitalsList
  } catch (error: any) {
    console.error('Error fetching hospitals:', error)
    throw new Error(error.toString())
  }
}
