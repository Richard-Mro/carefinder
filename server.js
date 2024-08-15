import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { fetchAndUploadHospitals } from './src/api/uploadToFirestore.mjs'
import { shareHospitalsViaEmail } from './src/api/shareHospitals.mjs'
import path from 'path'
import { fileURLToPath } from 'url'

config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json()) // To parse JSON bodies

// Define routes
app.get('/', (req, res) => {
  res.send('Welcome to the Hospital Finder API')
})


app.get('/api/hospitals', async (req, res) => {
  try {
    await fetchAndUploadHospitals()
    res.status(200).send('Hospitals fetched and uploaded successfully')
  } catch (error) {
    console.error('Error fetching and uploading hospitals:', error)
    res.status(500).send('Error fetching and uploading hospitals')
  }
})

app.post('/api/shareHospitalsViaEmail', async (req, res) => {
  console.log('Received request to share hospitals via email:', req.body)
  try {
    await shareHospitalsViaEmail(req.body) // Adjust if additional parameters are needed
    res.status(200).send('Hospitals shared via email successfully')
  } catch (error) {
    console.error('Error sharing hospitals via email:', error)
    res.status(500).send('Error sharing hospitals via email')
  }
})

// Serve static files from the 'public' directory if you have frontend assets
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, 'public')))

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

export default app
