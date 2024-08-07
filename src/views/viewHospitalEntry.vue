<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <MarkdownRenderer :markdown="hospitalDetails.markdown" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

interface HospitalDetails {
  markdown: string;
  // Add other fields as needed
}

export default defineComponent({
  name: 'ViewHospitalEntry',
  components: {
    MarkdownRenderer
  },
  setup() {
    const route = useRoute()
    const hospitalDetails = ref<HospitalDetails>({ markdown: '' })
    const error = ref<string | null>(null)
    const loading = ref(true)

    onMounted(async () => {
      const id = route.params.id as string
      console.log(`Route params:`, route.params)

      if (!id || typeof id !== 'string' || id === ':id') {
        console.error('Invalid ID:', id)
        error.value = 'Invalid or missing ID!'
        loading.value = false
        return
      }

      const docRef = doc(db, 'hospitals', id)
      try {
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          console.log('Document data:', docSnap.data())
          hospitalDetails.value = docSnap.data() as HospitalDetails
        } else {
          console.error('No document found with ID:', id)
          error.value = `No document found with ID: ${id}`
        }
      } catch (err) {
        const errorMsg = (err as Error).message
        console.error('Error fetching document:', errorMsg)
        error.value = 'Error fetching document!'
      } finally {
        loading.value = false
      }
    })

    return {
      hospitalDetails,
      error,
      loading
    }
  }
})
</script>
