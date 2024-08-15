import axios from 'axios'

export const exportHospitals = async () => {
  try {
    const response = await axios.get(
      'https://carefinder-70ff2.cloudfunctions.net/exportHospitalsToCSV'
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
