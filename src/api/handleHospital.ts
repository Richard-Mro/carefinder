// src/api/handleHospitals.ts
import { fetchHospitals } from './fetchHospitals'
import { uploadHospitals } from './uploadToFirestore'

export const handleHospitals = async () => {
  try {
    const hospitals = await fetchHospitals()
    await uploadHospitals(hospitals)
    console.log('Hospitals uploaded successfully')
  } catch (error) {
    console.error('Error in handleHospitals function:', error)
  }
}
