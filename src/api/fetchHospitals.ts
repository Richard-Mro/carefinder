import axios from 'axios'

const serverUrl = 'http://localhost:3000/api/hospitals'

export const fetchHospitals = async () => {
  try {
    const response = await axios.get(serverUrl)
    return response.data.results
  } catch (error: any) {
    console.error('Error fetching hospitals:', error)
    throw new Error(error.toString())
  }
}
