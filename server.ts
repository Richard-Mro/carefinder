// server.ts
import { db } from './src/firebase'
import axios from 'axios' 
import { collection, addDoc } from 'firebase/firestore'
const express = require ('express')
const cors = require ('cors')
import { config } from 'dotenv'

config()

const app = express()
const port = process.env.PORT || 3000
const apiKey = process.env.VITE_APP_GOOGLE_MAPS_API_KEY

app.use(cors())

interface Hospital {
  name: string
  vicinity: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  international_phone_number?: string
  email?: string
}

app.get('/api/hospitals', async (req, res) => {
  if (!db) {
    res.status(500).send('Firestore database is not initialized')
    return
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=9.0820,8.6753&radius=50000&type=hospital&key=${apiKey}`
    const response = await axios.get(url)

    const hospitals: Hospital[] = response.data.results.map((result: any) => ({
      name: result.name,
      vicinity: result.vicinity,
      geometry: {
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      },
      international_phone_number: result.international_phone_number || 'N/A',
      email: result.email || 'N/A'
    }))

    const hospitalsCollection = collection(db, 'hospitals')

    const uploadPromises = hospitals.map(async (hospital) => {
      try {
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

    res.json({ results: hospitals })
  } catch (error) {
    res.status(500).send('Error fetching data from Google Places API')
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

export default app
