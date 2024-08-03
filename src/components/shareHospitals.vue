<template>
  <div>
    <h1>Shared Hospitals</h1>
    <ul>
      <li v-for="hospital in hospitals" :key="hospital.id">
        <h3>{{ hospital.name }}</h3>
        <p>Address: {{ hospital.address }}</p>
        <p>Phone: {{ hospital.phone }}</p>
        <p>Website: <a :href="hospital.website" target="_blank">{{ hospital.website }}</a></p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Hospital } from '@/api/types';

export default defineComponent({
  name: 'ShareHospitals',
  setup() {
    const hospitals = ref<Hospital[]>([]);

    onMounted(() => {
      const params = new URLSearchParams(window.location.search);
      const hospitalsData = params.get('hospitals');
      if (hospitalsData) {
        hospitals.value = JSON.parse(decodeURIComponent(hospitalsData)) as Hospital[];
      }
    });

    return {
      hospitals
    };
  }
});
</script>
