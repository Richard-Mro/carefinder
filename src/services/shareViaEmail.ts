import axios from 'axios'

export const shareViaEmail = async (
  email: string,
  hospitalList: { id: string; name: string; address: string; phone: string; website: string }[]
) => {
  try {
    const response = await axios.post(
      'https://us-central1-carefinder-70ff2.cloudfunctions.net/shareHospitalsViaEmail',
      {
        email,
        hospitals: hospitalList // Send the list of filtered hospitals to the backend
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
    if (axios.isAxiosError(error)) {
      console.error('Error sharing hospitals via email:', error.response?.data || error.message)
    } else {
      console.error('Error sharing hospitals via email:', error)
    }
    throw new Error('Failed to send email.')
  }
}
