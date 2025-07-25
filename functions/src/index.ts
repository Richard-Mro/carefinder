import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as cors from 'cors'
import * as nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { google } from 'googleapis'
import { Parser } from 'json2csv'
import * as os from 'os'

admin.initializeApp()
const bucket = admin.storage().bucket()
const app = express()

const allowedOrigins = ['http://localhost:5173', 'https://carefinder-70ff2.web.app']

// ✅ Manual CORS handler
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  next()
})

// Still include express CORS for fallback compatibility
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

const oAuth2Client = new google.auth.OAuth2(
  functions.config().google.client_id,
  functions.config().google.client_secret,
  'https://developers.google.com/oauthplayground'
)
oAuth2Client.setCredentials({ refresh_token: functions.config().google.refresh_token })

async function getAccessToken(): Promise<string> {
  try {
    const accessTokenResponse = await oAuth2Client.getAccessToken()
    return accessTokenResponse?.token ?? ''
  } catch (error) {
    console.error('Error getting access token:', error)
    return ''
  }
}

async function createTransporter(): Promise<nodemailer.Transporter> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) throw new Error('Failed to retrieve access token for Nodemailer.')

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: functions.config().email.user,
        clientId: functions.config().google.client_id,
        clientSecret: functions.config().google.client_secret,
        refreshToken: functions.config().google.refresh_token,
        accessToken: accessToken
      }
    })
  } catch (error) {
    console.error('Detailed error creating email transporter:', error)
    throw new Error(`Failed to create email transporter: ${String(error)}`)
  }
}

app.get('/getFirebaseConfig', (req, res) => {
  res.json({
    apiKey: functions.config().custom.firebase.api_key,
    authDomain: functions.config().custom.firebase.auth_domain,
    projectId: functions.config().custom.firebase.project_id,
    databaseURL: functions.config().custom.firebase.database_url,
    storageBucket: functions.config().custom.firebase.storage_bucket,
    messagingSenderId: functions.config().custom.firebase.messaging_sender_id,
    appId: functions.config().custom.firebase.app_id,
    measurementId: functions.config().custom.firebase.measurement_id,
    googleMapsApiKey: functions.config().custom.google.maps_api_key
  })
})

app.post('/exportHospitalsToCSV', async (req, res) => {
  try {
    const hospitals = req.body.hospitals
    const keyword = (req.body.keyword || 'all').replace(/\s+/g, '_').toLowerCase()

    if (!Array.isArray(hospitals) || hospitals.length === 0) {
      return res.status(400).send('No hospitals data provided or invalid format.')
    }

    const csvData = [['ID', 'Name', 'Address', 'Phone', 'Website']]
    hospitals.forEach((hospital: any) => {
      csvData.push([
        hospital.id ?? '',
        hospital.name ?? '',
        hospital.address ?? '',
        hospital.phone ?? '',
        hospital.website ?? ''
      ])
    })

    const csvContent = csvData.map((row) => row.map((field) => `"${field}"`).join(',')).join('\n')
    const csvFileName = `hospitals_${keyword}_${uuidv4()}.csv`
    const filePath = path.join(os.tmpdir(), csvFileName)
    fs.writeFileSync(filePath, csvContent)

    await bucket.upload(filePath, {
      destination: `exports/${csvFileName}`,
      public: true,
      metadata: { contentType: 'text/csv' }
    })

    fs.unlinkSync(filePath)
    res
      .status(200)
      .json({ url: `https://storage.googleapis.com/${bucket.name}/exports/${csvFileName}` })
  } catch (error) {
    console.error('Unexpected error during CSV export:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.post('/shareHospitalsViaEmail', async (req, res) => {
  const csvFilePath = path.join(os.tmpdir(), 'hospitals.csv')
  try {
    const { recipientEmail, hospitals } = req.body
    if (!recipientEmail || !Array.isArray(hospitals)) {
      return res.status(400).send({ success: false, message: 'Invalid input.' })
    }

    const fields = ['name', 'address', 'phone', 'website']
    const parser = new Parser({ fields })
    const csvData = parser.parse(hospitals)
    fs.writeFileSync(csvFilePath, csvData)

    const transporter = await createTransporter()
    const mailOptions = {
      from: functions.config().email.user,
      to: recipientEmail,
      subject: 'Hospital List from Carefinder',
      text: 'Please find attached the hospital list in CSV format.',
      attachments: [{ filename: 'hospitals.csv', path: csvFilePath }]
    }

    await transporter.sendMail(mailOptions)
    res.status(200).send({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).send({ success: false, message: 'Failed to send email.' })
  } finally {
    if (fs.existsSync(csvFilePath)) fs.unlinkSync(csvFilePath)
  }
})

app.post('/generateShareableLinkForFilteredHospitals', async (req, res) => {
  try {
    const hospitalIds = Array.isArray(req.body?.hospitalIds) ? req.body.hospitalIds : []
    if (hospitalIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid hospital IDs provided.' })
    }

    const cleanedHospitalIds = hospitalIds.filter(
      (id: any) => typeof id === 'string' && id.trim() !== ''
    )

    if (cleanedHospitalIds.length === 0) {
      return res.status(400).json({ success: false, message: 'All hospital IDs are invalid.' })
    }

    const uniqueId = uuidv4()
    const shareableUrl = `https://carefinder-70ff2.web.app/shared-results/${uniqueId}`

    await admin.firestore().collection('sharedLinks').doc(uniqueId).set({
      hospitalIds: cleanedHospitalIds,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return res.status(200).json({ success: true, shareableUrl })
  } catch (error: any) {
    console.error('🔥 Error generating shareable link:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to generate shareable link.',
      details: error?.message || 'Unknown error'
    })
  }
})

export const api = functions.https.onRequest(app)
