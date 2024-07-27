/// <reference types="google.maps" />
declare const google: any 

export async function getCurrentLocation(): Promise<google.maps.LatLng | null> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
          resolve(location)
        },
        (error) => {
          reject(error)
        }
      )
    } else {
      reject(new Error('Geolocation is not supported by this browser.'))
    }
  })
}
