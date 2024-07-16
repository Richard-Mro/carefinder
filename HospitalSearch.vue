<!-- HospitalSearch.vue -->
<template>
  <div>
    <input type="text" v-model="searchKeyword" @input="performSearch">
    <button @click="searchNearbyHospitals">Search Nearby Hospitals</button>
    <ul>
      <li v-for="hospital in hospitals" :key="hospital.name">
        {{ hospital.name }} - Lat: {{ hospital.location.latitude }}, Lng: {{ hospital.location.longitude }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { searchHospitals, searchHospitalsNearby } from '@/hospitalService';
import { getCurrentLocation } from '@/geolocationHelper';

interface Hospital {
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default defineComponent({
  name: 'HospitalSearch',
  setup() {
    const searchKeyword = ref('');
    const hospitals = ref<Hospital[]>([]);

    const performSearch = async () => {
      try {
        const results = await searchHospitals(searchKeyword.value);
        hospitals.value = results;
      } catch (error) {
        console.error('Error searching hospitals:', error);
      }
    };

    const searchNearbyHospitals = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          const results = await searchHospitalsNearby(location.lat(), location.lng());
          hospitals.value = results;
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    return {
      searchKeyword,
      hospitals,
      performSearch,
      searchNearbyHospitals,
    };
  },
});
</script>
