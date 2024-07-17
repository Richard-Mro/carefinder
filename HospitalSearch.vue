<template>
  <div>
    <input type="text" v-model="searchKeyword" @input="performSearch" placeholder="Search hospitals...">
    <button @click="searchNearbyHospitals">Search Nearby Hospitals</button>
    <ul>
      <li v-for="hospital in hospitals" :key="hospital.name">
        {{ hospital.name }} - Lat: {{ hospital.location.latitude }}, Lng: {{ hospital.location.longitude }}
      </li>
    </ul>
    <div id="map"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { searchHospitals, searchHospitalsNearby } from '@/hospitalService';
import { getCurrentLocation } from '@/geolocationHelper';

interface Hospital {
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// Declare initMap function on the Window interface
declare global {
  interface Window {
    initMap: () => void;
  }
}

export default defineComponent({
  name: 'HospitalSearch',
  setup() {
    const searchKeyword = ref('');
    const hospitals = ref<Hospital[]>([]);
    let map: google.maps.Map | null = null;
    const markers: google.maps.Marker[] = [];

    const performSearch = async () => {
      try {
        const results = await searchHospitals(searchKeyword.value);
        hospitals.value = results;
        updateMapMarkers();
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
          updateMapMarkers();
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    const updateMapMarkers = () => {
      if (!map) return;
      markers.forEach(marker => marker.setMap(null));
      markers.length = 0;

      hospitals.value.forEach(hospital => {
        const marker = new google.maps.Marker({
          position: { lat: hospital.location.latitude, lng: hospital.location.longitude },
          map: map!,
          title: hospital.name
        });
        markers.push(marker);
      });
    };

    onMounted(() => {
      window.initMap = () => {
        map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8
        });
        updateMapMarkers();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });

    return {
      searchKeyword,
      hospitals,
      performSearch,
      searchNearbyHospitals,
    };
  },
});
</script>

<style scoped>
#map {
  height: 400px;
  width: 100%;
}
</style>
