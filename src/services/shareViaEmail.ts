import axios from 'axios'

export const shareViaEmail = async (email: string, hospitalList: string[]) => {
  try {
    const response = await axios.post('http://localhost:3000/api/shareHospitalsViaEmail', {
      recipientEmail: email,
      hospitalList
    })
    console.log('Response from server:', response.data)
    return 'Email sent successfully.'
  } catch (error) {
    console.error('Error sharing hospitals via email:', error)
    throw new Error('Failed to send email.')
  }
}
