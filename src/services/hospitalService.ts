import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  Firestore
} from 'firebase/firestore'
import { db } from '../firebase'
import { Hospital } from 'src/api/types'

// Helper function to get a Firestore collection
function getFirestoreCollection(db: Firestore | undefined, collectionName: string) {
  if (!db) {
    throw new Error('Firestore is not initialized.')
  }
  return collection(db, collectionName)
}

// Function to fetch all hospitals
export const getAllHospitals = async (): Promise<Hospital[]> => {
  const hospitalsRef = getFirestoreCollection(db, 'hospitals')
  const snapshot = await getDocs(hospitalsRef)
  const hospitals: Hospital[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    hospitals.push({
      id: doc.id,
      name: data.name || 'Unknown',
      address: data.address || 'Unknown',
      phone: data.phone || 'N/A',
      website: data.website || 'N/A',
      markdown: data.markdown || 'N/A',
      location: {
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0
      }
    })
  })

  return hospitals
}

// Function to fetch a single hospital by ID
export const getHospitalById = async (id: string): Promise<Hospital | null> => {
  const docRef = doc(db, 'hospitals', id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as Hospital
  } else {
    return null
  }
}

// Function to search hospitals by keyword
export async function searchHospitals(keyword: string): Promise<Hospital[]> {
  const hospitalsRef = getFirestoreCollection(db, 'hospitals')
  const lowerCaseKeyword = keyword.toLowerCase()
  const snapshot = await getDocs(hospitalsRef)
  const hospitals: Hospital[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    const name = (data.name || 'Unknown').toLowerCase()
    const address = (data.address || 'Unknown').toLowerCase()

    if (name.includes(lowerCaseKeyword) || address.includes(lowerCaseKeyword)) {
      hospitals.push({
        id: doc.id,
        name: data.name || 'Unknown',
        address: data.address || 'Unknown',
        phone: data.phone || 'N/A',
        website: data.website || 'N/A',
        markdown: data.markdown || 'N/A',
        location: {
          latitude: data.latitude ?? 0,
          longitude: data.longitude ?? 0
        }
      })
    }
  })

  return hospitals
}

// Function to update a hospital's markdown
export const updateHospitalMarkdown = async (id: string, markdown: string) => {
  const hospitalRef = doc(db, 'hospitals', id)
  await updateDoc(hospitalRef, { markdown })
}

// Function to search nearby hospitals
export async function searchHospitalsNearby(lat: number, lng: number): Promise<Hospital[]> {
  const hospitalsRef = getFirestoreCollection(db, 'hospitals')
  const radius = 10 // Radius in kilometers

  const latDelta = radius / 111
  const latMin = lat - latDelta
  const latMax = lat + latDelta

  const lngDelta = radius / (111 * Math.cos(lat * (Math.PI / 180)))
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
        markdown: data.markdown || 'N/A',
        location: {
          latitude: hospitalLat,
          longitude: hospitalLng
        }
      })
    }
  })

  return hospitals
}

// Helper function to check if a hospital is within the radius
function isNearby(
  hospitalLat: number,
  hospitalLng: number,
  userLat: number,
  userLng: number,
  radius = 10
): boolean {
  const toRad = (degree: number) => degree * (Math.PI / 180)

  const R = 6371 // Radius of Earth in kilometers
  const dLat = toRad(hospitalLat - userLat)
  const dLng = toRad(hospitalLng - userLng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) * Math.cos(toRad(hospitalLat)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance <= radius
}
