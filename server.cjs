const express = require('express')
const cors = require('cors')
const { config } = require('dotenv')

config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())

app.get('/api/hospitals', async (req, res) => {
  try {
    const { fetchAndUploadHospitals } = await import('./src/api/uploadToFirestore.mjs')
    await fetchAndUploadHospitals()
    res.status(200).send('Hospitals fetched and uploaded successfully')
  } catch (error) {
    console.error('Error fetching and uploading hospitals:', error)
    res.status(500).send('Error fetching and uploading hospitals')
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
