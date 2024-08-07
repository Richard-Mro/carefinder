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

    const hospitalsList: Hospital[] = snapshot.docs
      .map((doc) => {
        const data = doc.data()

        // Normalize data structure
        const hospitalData: Partial<Hospital> = {
          name: data.name || 'Unknown',
          address: data.address || 'Unknown',
          phone: data.phone || 'Not Provided',
          website: data.website || 'Not Available', // Updated from email to website
          markdown: data.markdown || 'N/A',
          location: {
            latitude: data.location?.latitude ?? 0,
            longitude: data.location?.longitude ?? 0
          }
        }

        // Validate the required fields
        if (!hospitalData.name || !hospitalData.address || !hospitalData.location) {
          console.error('Invalid hospital data:', data)
          return null
        }

        return {
          id: doc.id,
          ...hospitalData
        } as Hospital
      })
      .filter((hospital): hospital is Hospital => hospital !== null)

    return hospitalsList
  } catch (error: any) {
    console.error('Error fetching hospitals:', error)
    throw new Error(error.toString())
  }
}
