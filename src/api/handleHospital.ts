import { fetchHospitals } from './fetchHospitals'

import { Hospital } from './types'

export const handleHospitals = async () => {
  try {
    const hospitals: Hospital[] = await fetchHospitals()
    await uploadHospitals(hospitals)
    console.log('Hospitals uploaded successfully')
  } catch (error) {
    console.error('Error in handleHospitals function:', error)
  }
}
