<template>
  <div>
    <MarkdownEditor v-model="hospitalDetails.markdown" />
    <button @click="saveEntry">Save Entry</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

export default defineComponent({
  name: 'CreateHospitalEntry',
  components: {
    MarkdownEditor
  },
  setup() {
    const hospitalDetails = ref({
      name: '',
      markdown: ''
    })

    const saveEntry = async () => {
      try {
        await addDoc(collection(db, 'hospitals'), {
          name: hospitalDetails.value.name,
          markdown: hospitalDetails.value.markdown
        })
        console.log('Hospital entry saved successfully')
      } catch (error) {
        console.error('Error saving hospital entry: ', error)
      }
    }

    return {
      hospitalDetails,
      saveEntry
    }
  }
})
</script>
