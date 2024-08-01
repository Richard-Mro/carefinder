

import { collection, query, where, getDocs, Firestore } from 'firebase/firestore'
import { db } from '../firebase'

interface Hospital {
  name: string
  address: string
  phone: string
  email: string
  location: {
    latitude: number
    longitude: number
  }
}

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
    hospitals.push({
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      location: {
        latitude: data.location.latitude,
        longitude: data.location.longitude
      }
    })
  })

  return hospitals
}

export async function searchHospitalsNearby(lat: number, lng: number): Promise<Hospital[]> {
  const hospitalsRef = getFirestoreCollection(db, 'hospitals')
  const radius = 10 // Adjust radius as needed

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
    where('location.latitude', '>=', latMin),
    where('location.latitude', '<=', latMax),
    where('location.longitude', '>=', lngMin),
    where('location.longitude', '<=', lngMax)
  )

  const snapshot = await getDocs(q)
  const hospitals: Hospital[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    if (isNearby(data.location.latitude, data.location.longitude, lat, lng, radius)) {
      hospitals.push({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
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
