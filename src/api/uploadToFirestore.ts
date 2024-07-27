import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { Hospital } from './types'

export const uploadHospitals = async (hospitals: Hospital[]) => {
  if (!db) {
    throw new Error('Firestore database is not initialized')
  }
  const hospitalsCollection = collection(db, 'hospitals')

  const uploadPromises = hospitals.map(async (hospital) => {
    try {
      if (!hospital.geometry || !hospital.geometry.location) {
        throw new Error('Missing location data')
      }

      await addDoc(hospitalsCollection, {
        name: hospital.name,
        address: hospital.vicinity,
        latitude: hospital.geometry.location.lat,
        longitude: hospital.geometry.location.lng,
        phone: hospital.international_phone_number || 'N/A',
        email: hospital.email || 'N/A'
      })
      console.log(`Uploaded hospital: ${hospital.name}`)
    } catch (error) {
      console.error('Error uploading hospital:', error)
    }
  })

  await Promise.all(uploadPromises)
}
