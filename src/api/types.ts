export interface Hospital {
  id: string
  name: string
  vicinity: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  international_phone_number?: string
  email?: string
}
