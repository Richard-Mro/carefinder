// src/utils/shareHelpers.ts

import { Hospital } from '../api/types'

export const composeEmailBody = (hospitals: Hospital[]): string => {
  let emailBody = 'Here is the list of hospitals:\n\n'
  hospitals.forEach((hospital) => {
    emailBody += `Name: ${hospital.name}\n`
    emailBody += `Address: ${hospital.address}\n`
    emailBody += `Phone: ${hospital.phone}\n`
    emailBody += `Website: ${hospital.website}\n`
    emailBody += `\n`
  })
  return emailBody
}

export const generateShareableLink = (hospitals: Hospital[]): string => {
  const baseUrl = window.location.origin
  const hospitalsData = encodeURIComponent(JSON.stringify(hospitals))
  return `${baseUrl}/share?hospitals=${hospitalsData}`
}
