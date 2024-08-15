import { onRequest } from 'firebase-functions/v1/https'
import * as functions from 'firebase-functions'
import * as logger from 'firebase-functions/logger'
import { Request, Response } from 'express'
import * as admin from 'firebase-admin'
import * as csv from 'csv-writer'
import * as nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'

admin.initializeApp()

// Get Firebase Config
export const getFirebaseConfig = onRequest((request: Request, response: Response) => {
  response.json({
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

// Export Hospitals to CSV
export const exportHospitalsToCSV = onRequest(
  async (request: Request, response: Response): Promise<void> => {
    try {
      const hospitalsSnapshot = await admin.firestore().collection('hospitals').get()
      const hospitals = hospitalsSnapshot.docs.map((doc) => doc.data())

      const csvFileName = `hospitals_${uuidv4()}.csv`
      const csvFilePath = path.join('/tmp', csvFileName)

      const csvWriter = csv.createObjectCsvWriter({
        path: csvFilePath,
        header: [
          { id: 'name', title: 'Name' },
          { id: 'address', title: 'Address' },
          { id: 'phone', title: 'Phone' },
          { id: 'website', title: 'Website' }
        ]
      })

      await csvWriter.writeRecords(hospitals)

      const bucket = admin.storage().bucket()
      await bucket.upload(csvFilePath, {
        destination: `exports/${csvFileName}`,
        public: true
      })

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/exports/${csvFileName}`

      // Clean up temporary file
      fs.unlinkSync(csvFilePath)

      response.json({ success: true, url: fileUrl })
    } catch (error) {
      logger.error('Error exporting hospitals to CSV:', error)
      response.status(500).json({ success: false, message: 'Failed to export hospitals.' })
    }
  }
)

// Share Hospitals via Email
export const shareHospitalsViaEmail = onRequest(
  async (request: Request, response: Response): Promise<void> => {
    try {
      const { email, message } = request.body

      if (!email || !email.includes('@')) {
        response.status(400).json({ success: false, message: 'Valid email is required.' })
        return
      }

      const hospitalsSnapshot = await admin.firestore().collection('hospitals').get()
      const hospitals = hospitalsSnapshot.docs.map((doc) => doc.data())

      const csvFileName = `hospitals_${uuidv4()}.csv`
      const csvFilePath = path.join('/tmp', csvFileName)

      const csvWriter = csv.createObjectCsvWriter({
        path: csvFilePath,
        header: [
          { id: 'name', title: 'Name' },
          { id: 'address', title: 'Address' },
          { id: 'phone', title: 'Phone' },
          { id: 'website', title: 'Website' }
        ]
      })

      await csvWriter.writeRecords(hospitals)

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: functions.config().email.user,
          pass: functions.config().email.pass
        }
      })

      await transporter.sendMail({
        from: functions.config().email.user,
        to: email,
        subject: 'List of Hospitals',
        text: message || 'Please find the list of hospitals attached.',
        attachments: [
          {
            filename: csvFileName,
            path: csvFilePath
          }
        ]
      })

      // Clean up temporary file
      fs.unlinkSync(csvFilePath)

      response.json({ success: true, message: 'Email sent successfully.' })
    } catch (error) {
      logger.error('Error sharing hospitals via email:', error)
      response.status(500).json({ success: false, message: 'Failed to share hospitals.' })
    }
  }
)

// Generate Shareable Link
export const generateShareableLink = onRequest(
  async (request: Request, response: Response): Promise<void> => {
    try {
      const { hospitalId } = request.body

      if (!hospitalId) {
        response.status(400).json({ success: false, message: 'Hospital ID is required.' })
        return
      }

      const doc = await admin.firestore().collection('hospitals').doc(hospitalId).get()

      if (!doc.exists) {
        response.status(404).json({ success: false, message: 'Hospital not found.' })
        return
      }

      const data = doc.data()
      const hospitalName = data?.name || 'Unknown Hospital'

      const dynamicLink = `https://your-app.page.link/?link=https://your-app.com/hospital/${hospitalId}&apn=com.example.android&ibi=com.example.ios&st=${encodeURIComponent(hospitalName)}`

      response.json({ success: true, link: dynamicLink })
    } catch (error) {
      logger.error('Error generating shareable link:', error)
      response.status(500).json({ success: false, message: 'Failed to generate shareable link.' })
    }
  }
)

// Generate Dynamic Link using Firebase Dynamic Links API
export const generateDynamicLink = functions.https.onCall(
  async (data, context): Promise<{ shortLink: string }> => {
    const { hospitalId } = data
    if (!hospitalId) {
      throw new functions.https.HttpsError('invalid-argument', 'Hospital ID is required.')
    }

    const dynamicLinkParams = {
      dynamicLinkInfo: {
        domainUriPrefix: 'https://yourcustom.page.link',
        link: `https://yourdomain.com/hospital/${hospitalId}`,
        androidInfo: {
          androidPackageName: 'com.example.android'
        },
        iosInfo: {
          iosBundleId: 'com.example.ios'
        }
      }
    }

    try {
      const response = await axios.post(
        `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${functions.config().firebase.api_key}`,
        dynamicLinkParams
      )

      const shortLink = response.data.shortLink
      return { shortLink }
    } catch (error) {
      console.error('Error generating dynamic link:', error)
      throw new functions.https.HttpsError('internal', 'Failed to generate dynamic link.')
    }
  }
)
