// src/api/uploadToFirestore.ts
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

export const uploadHospitals = async (hospitals: any[]) => {
    if (!db) {
        throw new Error('Firestore database is not initialize')
    }
  const hospitalsCollection = collection(db, 'hospitals')

  const uploadPromises = hospitals.map(async (hospital) => {
    try {
      await addDoc(hospitalsCollection, {
        name: hospital.name,
        address: hospital.vicinity,
        latitude: hospital.geometry.location.lat,
        longitude: hospital.geometry.location.lng,
        phone: hospital.international_phone_number || 'N/A',
        email: hospital.email || 'N/A' // Assuming email is present, otherwise set to N/A
      })
    } catch (error) {
      console.error('Error uploading hospital:', error)
    }
  })

  await Promise.all(uploadPromises)
}
