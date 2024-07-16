import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore'
import { db } from './firebase' // Ensure db is correctly initialized as Firestore instance

interface Hospital {
  name: string
  location: {
    latitude: number
    longitude: number
  }
  // Add other fields as needed
}

export async function searchHospitals(keyword: string): Promise<Hospital[]> {
  const hospitalsRef = collection(db, 'hospitals')
  const q = query(hospitalsRef, where('name', '>=', keyword))
  const snapshot = await getDocs(q)
  const hospitals: Hospital[] = []
  snapshot.forEach((doc) => {
    const data = doc.data() as DocumentData // Explicitly type data as DocumentData
    hospitals.push({
      name: data.name,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude
      }
      // Map other fields accordingly
    })
  })
  return hospitals
}

export async function searchHospitalsNearby(lat: number, lng: number): Promise<Hospital[]> {
  const hospitalsRef = collection(db, 'hospitals')
  const snapshot = await getDocs(hospitalsRef)
  const hospitals: Hospital[] = []
  snapshot.forEach((doc) => {
    const data = doc.data() as DocumentData
    if (isNearby(data.location.latitude, data.location.longitude, lat, lng)) {
      hospitals.push({
        name: data.name,
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude
        }
      })
    }
  })
  return hospitals
}

function isNearby(
  hospitalLat: number,
  hospitalLng: number,
  userLat: number,
  userLng: number,
  radius = 10
): boolean {
  const distance = Math.sqrt(
    Math.pow(hospitalLat - userLat, 2) + Math.pow(hospitalLng - userLng, 2)
  )
  return distance <= radius
}
