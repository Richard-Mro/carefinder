import axios from 'axios'

export const shareViaEmail = async (email: string, hospitalList: string[]) => {
  try {
    const response = await axios.post(
      'https://us-central1-carefinder-70ff2.cloudfunctions.net/shareHospitalsViaEmail',
      {
        email, // Directly use the variable name if it matches
        message: `Here is the list of hospitals: ${hospitalList.join(', ')}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Response from server:', response.data)
    return 'Email sent successfully.'
  } catch (error) {
    // Use `axios` error response if available
    if (axios.isAxiosError(error)) {
      console.error('Error sharing hospitals via email:', error.response?.data || error.message)
    } else {
      console.error('Error sharing hospitals via email:', error)
    }
    throw new Error('Failed to send email.')
  }
}
