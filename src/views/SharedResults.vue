<template>
  <div>
    <h2>Shared Hospital Results</h2>
    <div v-if="loading">Loading shared hospitals...</div>
    <ul v-else>
      <li v-for="hospital in hospitals" :key="hospital.id">
        {{ hospital.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'


const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_APP_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const route = useRoute()
const hospitals = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  const docId = route.params.id as string
  const linkDoc = await getDoc(doc(db, 'sharedLinks', docId))

  if (linkDoc.exists()) {
    const hospitalIds: string[] = linkDoc.data().hospitalIds || []

    const promises = hospitalIds.map(id => getDoc(doc(db, 'hospitals', id)))
    const results = await Promise.all(promises)

    hospitals.value = results
      .filter(d => d.exists())
      .map(d => ({ id: d.id, ...d.data() }))

  } else {
    console.error('Shared link not found')
  }

  loading.value = false
})
</script>
