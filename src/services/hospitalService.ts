import { collection, query, where, getDocs, Firestore } from 'firebase/firestore'
import { db } from '../firebase'
import { Hospital } from 'src/api/types'

function getFirestoreCollection(db: Firestore | undefined, collectionName: string) {
  if (!db) {
    throw new Error('Firestore is not initialized.')
  }
  return collection(db, collectionName)
}

export async function searchHospitals(keyword: string): Promise<Hospital[]> {
  const hospitalsRef = getFirestoreCollection(db, 'hospitals')
  const q = query(hospitalsRef, where('name', '>=', keyword))
  const snapshot = await getDocs(q)
  const hospitals: Hospital[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    console.log('Fetched data:', data) // Debugging log

    hospitals.push({
      id: doc.id,
      name: data.name || 'Unknown',
      address: data.address || 'Unknown',
      phone: data.phone || 'N/A',
      website: data.website || 'N/A',
      location: {
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0
      }
    })
  })

  return hospitals
}

export async function searchHospitalsNearby(lat: number, lng: number): Promise<Hospital[]> {
  const hospitalsRef = getFirestoreCollection(db, 'hospitals')
  const radius = 10 // Radius in kilometers

  // Calculate latitude bounds
  const latDelta = radius / 111 // Approx. 1 degree latitude is about 111 km
  const latMin = lat - latDelta
  const latMax = lat + latDelta

  // Calculate longitude bounds
  const lngDelta = radius / (111 * Math.cos(lat * (Math.PI / 180))) // Adjust for longitude based on latitude
  const lngMin = lng - lngDelta
  const lngMax = lng + lngDelta

  const q = query(
    hospitalsRef,
    where('latitude', '>=', latMin),
    where('latitude', '<=', latMax),
    where('longitude', '>=', lngMin),
    where('longitude', '<=', lngMax)
  )

  const snapshot = await getDocs(q)
  const hospitals: Hospital[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()

    const hospitalLat = data.latitude ?? 0
    const hospitalLng = data.longitude ?? 0

    if (isNearby(hospitalLat, hospitalLng, lat, lng, radius)) {
      hospitals.push({
        id: doc.id,
        name: data.name || 'Unknown',
        address: data.address || 'Unknown',
        phone: data.phone || 'N/A',
        website: data.website || 'N/A',
        location: {
          latitude: hospitalLat,
          longitude: hospitalLng
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
  const R = 6371 // Radius of the Earth in km
  const dLat = (hospitalLat - userLat) * (Math.PI / 180)
  const dLng = (hospitalLng - userLng) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * (Math.PI / 180)) *
      Math.cos(hospitalLat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km

  return distance <= radius
}
