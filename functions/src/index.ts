import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as cors from 'cors'
import * as nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { google } from 'googleapis'
import { Request, Response } from 'express'
import * as os from 'os'
import { Parser } from 'json2csv'

admin.initializeApp()
const bucket = admin.storage().bucket()
const corsHandler = cors({ origin: true })

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  functions.config().google.client_id,
  functions.config().google.client_secret,
  'https://developers.google.com/oauthplayground'
)
oAuth2Client.setCredentials({ refresh_token: functions.config().google.refresh_token })

// Function to get access token for OAuth2
async function getAccessToken(): Promise<string> {
  try {
    const accessTokenResponse = await oAuth2Client.getAccessToken()
    return accessTokenResponse?.token ?? ''
  } catch (error) {
    console.error('Error getting access token:', error)
    return ''
  }
}

// Create a transporter for sending emails
async function createTransporter(): Promise<nodemailer.Transporter> {
  try {
    const accessToken = await getAccessToken()
    console.log(
      'Access token retrieved (first 10 chars):',
      accessToken ? accessToken.substring(0, 10) + '...' : 'N/A'
    ) // Log part of token for debugging

    if (!accessToken) {
      console.error(
        'Failed to retrieve access token for Nodemailer. Access token was empty or null.'
      )
      throw new Error('Failed to retrieve access token for Nodemailer.')
    }

    const transporter = nodemailer.createTransport({
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
    console.log('Nodemailer transporter created successfully.')
    return transporter
  } catch (error) {
    console.error('Detailed error creating email transporter:', error) // Log the full error object
    throw new Error(
      `Failed to create email transporter: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

// Get Firebase Config
export const getFirebaseConfig = functions.https.onRequest((req: Request, res: Response) => {
  corsHandler(req, res, () => {
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
})

// Export Hospitals to CSV with filtered data
export const exportHospitalsToCSV = functions.https.onRequest(
  async (req: Request, res: Response) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).send('Method Not Allowed. Use POST.')
          return
        }

        const hospitals = req.body.hospitals
        const keyword = (req.body.keyword || 'all').replace(/\s+/g, '_').toLowerCase()

        // Validate hospitals payload
        if (!Array.isArray(hospitals) || hospitals.length === 0) {
          console.error('Invalid or empty hospitals data received:', hospitals)
          res.status(400).send('No hospitals data provided or invalid format.')
          return
        }

        console.log('Received hospitals data for CSV export:', JSON.stringify(hospitals, null, 2))

        // Prepare CSV data
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

        const csvContent = csvData
          .map((row) => row.map((field) => `\"${field}\"`).join(','))
          .join('\n')

        console.log('CSV content ready for writing:', csvContent)

        // Write to temp file
        const csvFileName = `hospitals_${keyword}_${uuidv4()}.csv`
        const filePath = path.join('/tmp', csvFileName)
        fs.writeFileSync(filePath, csvContent)

        try {
          await bucket.upload(filePath, {
            destination: `exports/${csvFileName}`,
            public: true,
            metadata: {
              contentType: 'text/csv'
            }
          })

          const fileUrl = `https://storage.googleapis.com/${bucket.name}/exports/${csvFileName}`
          res.status(200).json({ url: fileUrl })
        } catch (uploadError) {
          console.error('Error uploading CSV to bucket:', uploadError)
          res.status(500).send('Error uploading CSV.')
        } finally {
          // Cleanup temp file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }
      } catch (error) {
        console.error('Unexpected error during CSV export:', error)
        res.status(500).send('Internal Server Error')
      }
    })
  }
)

// Share Hospitals via Email with filtered data
export const shareHospitalsViaEmail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const csvFilePath = path.join(os.tmpdir(), 'hospitals.csv')
    try {
      if (req.method !== 'POST') {
        return res.status(405).send({ success: false, message: 'Use POST' })
      }

      const { recipientEmail, hospitals } = req.body

      if (!recipientEmail || !hospitals || !Array.isArray(hospitals)) {
        return res.status(400).send({
          success: false,
          message: 'Invalid input. Expected recipientEmail and hospitals array.'
        })
      }

      const fields = ['name', 'address', 'phone', 'website'] // corrected lowercase keys
      const parser = new Parser({ fields })
      const csvData = parser.parse(hospitals)

      fs.writeFileSync(csvFilePath, csvData)

      const transporter = await createTransporter() // Uses OAuth2 properly

      const mailOptions = {
        from: functions.config().email.user,
        to: recipientEmail,
        subject: 'Hospital List from Carefinder',
        text: 'Please find attached the hospital list in CSV format.',
        attachments: [
          {
            filename: 'hospitals.csv',
            path: csvFilePath
          }
        ]
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
})

// Generate Shareable Link for Filtered Hospitals
export const generateShareableLinkForFilteredHospitals = functions.https.onRequest(
  async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
      try {
        // Receive filtered hospitals list from the request body
        const filteredHospitalsList = req.body.hospitals

        // Map the received data to include all required details
        const hospitalsData = filteredHospitalsList.map((hospital: any) => ({
          id: hospital.id,
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          website: hospital.website
        }))

        // Encode the hospitals data into a query parameter
        const encodedHospitalsData = encodeURIComponent(JSON.stringify(hospitalsData))
        const longUrl = `https://carefinder-70ff2.web.app/filtered-hospitals?data=${encodedHospitalsData}`

        // Shorten the long URL using TinyURL
        const shortUrl = await shortenUrl(longUrl)
        res.json({ success: true, shortUrl })
      } catch (error) {
        console.error('Error generating shareable link:', error)
        res.status(500).json({ success: false, message: 'Failed to generate shareable link.' })
      }
    })
  }
)

// Function to shorten a URL using TinyURL
async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data)
      console.error('Axios error message:', error.message)
    } else if (error instanceof Error) {
      console.error('Error shortening URL:', error.message)
    } else {
      console.error('Unknown error occurred:', error)
    }
    throw new Error('Failed to shorten URL')
  }
}
