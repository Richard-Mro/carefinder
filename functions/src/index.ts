import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as cors from 'cors'
import * as nodemailer from 'nodemailer'
import * as csv from 'csv-writer'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { google } from 'googleapis'
import { Request, Response } from 'express'

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
async function getAccessToken() {
  const accessTokenResponse = await oAuth2Client.getAccessToken()
  return accessTokenResponse?.token ?? ''
}

// Create a transporter for sending emails
async function createTransporter() {
  const accessToken = await getAccessToken()

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
// Export Hospitals to CSV with filtered data
export const exportHospitalsToCSV = functions.https.onRequest(async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    try {
      const hospitals = req.body.hospitals; // Hospitals data sent from frontend

      // Log received hospitals data for debugging
      console.log('Received hospitals data for CSV export:', JSON.stringify(hospitals, null, 2)); 

      if (!hospitals || hospitals.length === 0) {
        res.status(400).send('No hospitals data provided.');
        return;
      }

      // Continue with CSV creation
      const csvData = [['ID', 'Name', 'Address', 'Phone', 'Website']];
      hospitals.forEach((hospital: any) => {
        csvData.push([
          hospital.id,
          hospital.name,
          hospital.address,
          hospital.phone,
          hospital.website
        ]);
      });

      console.log('CSV Data to be written:', JSON.stringify(csvData, null, 2)); // Log the CSV data

      const csvFileName = `hospitals_${uuidv4()}.csv`;
      const filePath = path.join('/tmp', csvFileName);
      fs.writeFileSync(filePath, csvData.join('\n'));

      try {
        await bucket.upload(filePath, { destination: `exports/${csvFileName}`, public: true });
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/exports/${csvFileName}`;
        res.status(200).json({ url: fileUrl });
      } catch (error) {
        console.error('Error uploading CSV to bucket:', error);
        res.status(500).send('Internal Server Error');
      } finally {
        fs.unlinkSync(filePath); // Clean up temporary file
      }
    } catch (error) {
      console.error('Error exporting hospitals to CSV:', error);
      res.status(500).send('Internal Server Error');
    }
  });
});


// Share Hospitals via Email with filtered data
export const shareHospitalsViaEmail = functions.region('us-central1').https.onRequest(async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.set('Allow', 'POST');
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { email, hospitals } = req.body; // Use the hospitals sent from the frontend

      console.log('Received hospitals data for email:', hospitals); // Debug log

      if (!email || !email.includes('@')) {
        res.status(400).json({ success: false, message: 'Valid email is required.' });
        return;
      }

      if (!hospitals || hospitals.length === 0) {
        res.status(400).json({ success: false, message: 'No hospitals data provided.' });
        return;
      }

      const csvFileName = `hospitals_${uuidv4()}.csv`;
      const csvFilePath = path.join('/tmp', csvFileName);
      const csvWriter = csv.createObjectCsvWriter({
        path: csvFilePath,
        header: [
          { id: 'name', title: 'Name' },
          { id: 'address', title: 'Address' },
          { id: 'phone', title: 'Phone' },
          { id: 'website', title: 'Website' }
        ]
      });
      await csvWriter.writeRecords(hospitals); // Use the provided hospitals data

      console.log('CSV file path:', csvFilePath); // Log the CSV file path

      const transporter = await createTransporter();
      const mailOptions = {
        from: functions.config().email.user,
        to: email,
        subject: 'List of Hospitals',
        text: 'Please find the list of hospitals attached.',
        attachments: [
          {
            filename: csvFileName,
            path: csvFilePath
          }
        ]
      };

      await transporter.sendMail(mailOptions);

      fs.unlinkSync(csvFilePath);

      res.json({ success: true, message: 'Email sent successfully.' });
    } catch (error) {
      console.error('Error sharing hospitals via email:', error);
      res.status(500).json({ success: false, message: 'Failed to share hospitals.' });
    }
  });
});




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
