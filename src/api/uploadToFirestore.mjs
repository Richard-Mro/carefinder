import { db } from '../firebase.server.mjs'
import axios from 'axios'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { config } from 'dotenv'

config()

const apiKey = process.env.VITE_APP_GOOGLE_MAPS_API_KEY

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

// Helper function to fetch all pages of results from Google Places API
const fetchAllPages = async (initialUrl) => {
  let url = initialUrl
  let allResults = []

  do {
    try {
      const response = await axios.get(url)
      console.log('API Response:', response.data) // Log the raw API response

      if (response.data && response.data.results) {
        allResults = allResults.concat(response.data.results)
      } else {
        console.warn('No results in API response:', response.data)
        break
      }

      const nextPageToken = response.data.next_page_token
      url = nextPageToken ? `${initialUrl}&pagetoken=${nextPageToken}` : ''

      if (nextPageToken) await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Error fetching paginated results:', error)
      break
    }
  } while (url !== '')

  return allResults
}

export const fetchHospitals = async () => {
  if (!db) {
    throw new Error('Firestore database is not initialized')
  }

  for (const state of states) {
    try {
      const initialUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hospitals%20OR%20clinics%20OR%20medical%20centers%20in%20${state}%20Nigeria&key=${apiKey}`
      console.log(`Fetching hospitals for ${state} with URL: ${initialUrl}`)
      const results = await fetchAllPages(initialUrl)

      if (!results || results.length === undefined) {
        console.warn(`Invalid results for ${state}:`, results)
        continue
      }

      console.log(`Fetched ${results.length} results for ${state}`)

      const placeIds = results.map((result) => result.place_id)
      console.log(`Place IDs for ${state}:`, placeIds)

      // Fetch detailed information for each place
      const detailedHospitals = await Promise.all(
        placeIds.map(async (placeId) => {
          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,international_phone_number,website,geometry&key=${apiKey}`
            const detailsResponse = await axios.get(detailsUrl)
            console.log('Details API Response for place_id', placeId, ':', detailsResponse.data)
            const result = detailsResponse.data.result

            return {
              name: result.name || 'Unknown',
              address: result.formatted_address || 'Unknown',
              phone: result.international_phone_number || 'Not Provided',
              website: result.website || 'Not Available',
              location: {
                latitude: result.geometry?.location?.lat || 0,
                longitude: result.geometry?.location?.lng || 0
              }
            }
          } catch (error) {
            console.error(`Error fetching details for place_id ${placeId}:`, error)
            return null
          }
        })
      )

      const filteredHospitals = detailedHospitals.filter((hospital) => hospital !== null)

      console.log(`Fetched detailed data from Google Places API for ${state}:`, filteredHospitals)

      // Upload hospitals to Firestore
      await uploadHospitals(filteredHospitals)
    } catch (error) {
      console.error(`Error fetching data from Google Places API for ${state}:`, error)
    }
  }
}

export const uploadHospitals = async (hospitals) => {
  if (!db) {
    throw new Error('Firestore database is not initialized')
  }

  const hospitalsCollection = collection(db, 'hospitals')

  for (const hospital of hospitals) {
    try {
      console.log('Uploading hospital data:', hospital)

      // Check if hospital already exists before adding
      const querySnapshot = await getDocs(
        query(
          hospitalsCollection,
          where('name', '==', hospital.name),
          where('address', '==', hospital.address)
        )
      )
      if (querySnapshot.empty) {
        await addDoc(hospitalsCollection, {
          name: hospital.name || 'Unknown',
          address: hospital.address || 'Unknown',
          latitude: hospital.location.latitude,
          longitude: hospital.location.longitude,
          phone: hospital.phone || 'Not Provided',
          website: hospital.website || 'Not Available'
        })
        console.log(`Uploaded hospital: ${hospital.name}`)
      } else {
        console.log(`Hospital already exists: ${hospital.name}`)
      }
    } catch (error) {
      console.error('Error uploading hospital:', error)
    }
  }
}

// Export the fetchHospitals function as fetchAndUploadHospitals
export const fetchAndUploadHospitals = fetchHospitals
