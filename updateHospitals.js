import admin from 'firebase-admin'
import { initializeApp, cert } from 'firebase-admin/app'
import fs from 'fs'
import path from 'path'

// Load the service account key JSON file
const serviceAccountPath = path.resolve('./serviceAccountKey.json')
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
})

const db = admin.firestore()

// Function to add/update hospital document
const addOrUpdateHospital = async (hospitalId, hospitalData) => {
  try {
    await db.collection('hospitals').doc(hospitalId).set(hospitalData, { merge: true })
    console.log(`Hospital document ${hospitalId} added/updated successfully.`)
  } catch (error) {
    console.error(`Error adding/updating hospital document ${hospitalId}:`, error)
  }
}

// Function to fetch all hospital documents
const fetchHospitals = async () => {
  try {
    const snapshot = await db.collection('hospitals').get()
    const hospitals = []

    snapshot.forEach((doc) => {
      hospitals.push({ id: doc.id, data: doc.data() })
    })

    return hospitals
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    return []
  }
}

// Example function to update multiple hospitals
const updateHospitals = async () => {
  const hospitals = await fetchHospitals()
  console.log(`Fetched ${hospitals.length} hospitals.`)

  for (const hospital of hospitals) {
    // Update the hospital data with new Markdown content
    const updatedData = {
      ...hospital.data,
      markdown: `# ${hospital.data.name}\n\nThis is an example Markdown content for ${hospital.data.name}.`
    }

    await addOrUpdateHospital(hospital.id, updatedData)
  }
}

updateHospitals()
  .then(() => {
    console.log('All hospital updates completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error updating hospitals:', error)
    process.exit(1)
  })
