<template>
  <div class="container">
    <h1>All Hospitals</h1>
    <ul class="hospital-list">
      <li v-for="hospital in hospitals" :key="hospital.id" class="hospital-card">
        <h3>{{ hospital.name }}</h3>
        <p>ADDRESS: {{ hospital.address }}</p>
        <p>PHONE-NO: {{ hospital.phone }}</p>
        <p>WEBSITE: <a :href="hospital.website" target="_blank" class="website-link">{{ hospital.website }}</a></p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Hospital } from '@/api/types';
import { getAllHospitals } from '@/services/hospitalService'; // Import the correct function

export default defineComponent({
  name: 'AllHospitals',
  setup() {
    const hospitals = ref<Hospital[]>([]);

    onMounted(async () => {
      try {
        hospitals.value = await getAllHospitals(); // Fetch all hospitals
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    });

    return {
      hospitals
    };
  }
});
</script>

<style scoped>
/* Add your styles here */
</style>
