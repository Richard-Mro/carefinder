import axios from 'axios'

export const createDynamicLink = async (hospitalId: string) => {
  const apiKey = import.meta.env.VITE_APP_FIREBASE_API_KEY
  const longDynamicLink = `https://carefinder-70ff2.web.app/hospitals/${hospitalId}`

  try {
    const response = await axios.post(
      `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`,
      {
        longDynamicLink: `${longDynamicLink}?apn=com.example.android&ibi=com.example.ios`,
        suffix: {
          option: 'SHORT'
        }
      }
    )

    return response.data.shortLink
  } catch (error) {
    console.error('Error creating dynamic link:', error)
    throw error
  }
}
