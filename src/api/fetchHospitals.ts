import axios from 'axios'

const apiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=9.0820,8.6753&radius=50000=hospital&key=${apiKey}`

export const fetchHospitals = async () => {
  try {
    const response = await axios(url)
    return response.data.results
  } catch (error: any) {
    console.error('Error fetching hospitals:', error)
    throw new Error(error.toString())
  }
}
