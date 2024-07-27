const express = require('express')
const axios = require('axios')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const apiKey = process.env.VITE_APP_GOOGLE_MAPS_API_KEY

app.use(cors())

app.get('/api/hospitals', async (req, res) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=9.0820,8.6753&radius=50000&type=hospital&key=${apiKey}`
    const response = await axios.get(url)
    res.json(response.data)
  } catch (error) {
    res.status(500).send('Error fetching data from Google Places API')
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

module.exports = app
