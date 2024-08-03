// src/utils/csvExporter.ts
import Papa from 'papaparse'

interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  website: string
  location: {
    latitude: number
    longitude: number
  }
}

export function exportHospitalsToCSV(hospitals: Hospital[]): string {
  return Papa.unparse(hospitals, {
    header: true,
    skipEmptyLines: true
  })
}
