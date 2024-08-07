export interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  website: string
  markdown: string
  location: {
    latitude: number
    longitude: number
  }
}
