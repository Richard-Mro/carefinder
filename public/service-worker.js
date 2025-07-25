// service-worker.js

importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/umd.js')
const { openDB } = idb

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error('Error caching resources during install:', error)
      })
    })
  )
})

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    )
  )
})

self.addEventListener('fetch', (event) => {
  const url = event.request.url

  if (
    url.includes('/api/') ||
    url.includes('cloudfunctions.net') ||
    url.includes('googleapis.com')
  ) {
    event.respondWith(fetch(event.request))
    return
  }

  if (url.includes('/hospitals')) {
    event.respondWith(
      (async () => {
        try {
          if (typeof openDB !== 'function') {
            throw new Error('openDB is not available')
          }

          const db = await openDB(DB_NAME, 1, {
            upgrade(db) {
              if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' })
              }
            }
          })

          const tx = db.transaction(STORE_NAME, 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const cachedHospitals = await store.getAll()

          if (cachedHospitals.length > 0) {
            console.log('Serving hospitals from IndexedDB')
            return new Response(JSON.stringify(cachedHospitals), {
              headers: { 'Content-Type': 'application/json' }
            })
          }

          const response = await fetch(event.request)
          const hospitals = await response.clone().json()

          const writeTx = db.transaction(STORE_NAME, 'readwrite')
          const writeStore = writeTx.objectStore(STORE_NAME)
          hospitals.forEach((hospital) => writeStore.put(hospital))
          await writeTx.done

          return response
        } catch (error) {
          console.error('Error handling hospitals fetch:', error)
          return fetch(event.request)
        }
      })()
    )
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).catch(() => {
            if (event.request.destination === 'document') {
              return caches.match('/offline.html')
            }
          })
        )
      })
    )
  }
})
