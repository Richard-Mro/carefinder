import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export const fetchHospitals = async () => {
  try {
    if (!db) {
      throw new Error('Firestore database is not initialized')
    }

    const hospitalsCollection = collection(db, 'hospitals')
    const snapshot = await getDocs(hospitalsCollection)
    const hospitalsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return hospitalsList
  } catch (error: any) {
    console.error('Error fetching hospitals:', error)
    throw new Error(error.toString())
  }
}
