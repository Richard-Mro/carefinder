import { db } from '../firebase'
import axios from 'axios'
import { config } from 'dotenv'

config()

const apiKey = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY

const states = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nassarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara'
]

export const fetchHospitals = async () => {
  if (!db) {
    throw new Error('Firestore database is not initialized')
  }

  for (const state of states) {
    try {
      // Fetch hospitals from the text search endpoint
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hospitals+in+${state}+Nigeria&key=${apiKey}`
      const response = await axios.get(url)
      const placeIds = response.data.results.map((result: any) => result.place_id)

      const detailedHospitals = await Promise.all(
        placeIds.map(async (placeId: string) => {
          // Fetch detailed information for each place
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
          const detailsResponse = await axios.get(detailsUrl)
          const result = detailsResponse.data.result

          return {
            id: result.place_id || 'Unknown',
            name: result.name || 'Unknown',
            address: result.formatted_address || 'Unknown',
            phone: result.international_phone_number || 'Not Provided',
            website: result.website || 'Not Available',
            location: {
              latitude: result.geometry?.location?.lat ?? 0,
              longitude: result.geometry?.location?.lng ?? 0
            }
          }
        })
      )

      console.log(`Fetched detailed data from Google Places API for ${state}:`, detailedHospitals)
    } catch (error) {
      console.error(`Error fetching data from Google Places API for ${state}:`, error)
    }
  }
}
