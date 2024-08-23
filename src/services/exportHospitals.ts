import axios from 'axios'

export const exportHospitals = async (
  hospitalList: { id: string; name: string; address: string; phone: string; website: string }[]
) => {
  try {
    const response = await axios.post(
      'https://us-central1-carefinder-70ff2.cloudfunctions.net/exportHospitalsToCSV',
      { hospitals: hospitalList }, // Send the filtered hospitals to the backend
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.url) {
      window.open(response.data.url, '_blank')
    } else {
      console.error('Error: No URL returned from the server.')
    }
  } catch (error) {
    console.error('Error exporting hospitals:', error)
    throw error
  }
}
