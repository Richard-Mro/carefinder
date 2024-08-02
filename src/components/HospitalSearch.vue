<template>
  <div>
    <!-- Search input -->
    <input
      type="text"
      v-model="searchKeyword"
      @input="performSearch"
      placeholder="Search hospitals..."
    />
    <!-- Button to search nearby hospitals -->
    <button @click="searchNearbyHospitals">Search Nearby Hospitals</button>
    
    <!-- List of hospitals -->
    <ul>
      <li v-for="hospital in hospitals" :key="hospital.id">
        <h3>{{ hospital.name }}</h3>
        <p>Address: {{ hospital.address }}</p>
        <p>Phone: {{ hospital.phone }}</p>
        <p>Website: <a :href="hospital.website" target="_blank">{{ hospital.website }}</a></p>
      </li>
    </ul>
    
    <!-- Map container -->
    <div id="map"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { searchHospitals, searchHospitalsNearby } from '@/services/hospitalService';
import { getCurrentLocation } from '@/services/geolocationHelper';
import { Hospital } from '@/api/types';

declare global {
  interface Window {
    initMap: () => void;
  }
}

interface LatLng {
  latitude: number;
  longitude: number;
}

export default defineComponent({
  name: 'HospitalSearch',
  setup() {
    const searchKeyword = ref('');
    const hospitals = ref<Hospital[]>([]);
    let map: google.maps.Map | null = null;
    const markers: google.maps.Marker[] = [];

    // Function to perform hospital search based on keyword
    const performSearch = async () => {
      try {
        const results = await searchHospitals(searchKeyword.value);
        hospitals.value = results as Hospital[];
        updateMapMarkers();
      } catch (error) {
        console.error('Error searching hospitals:', error);
      }
    };

    // Function to search nearby hospitals based on current location
    const searchNearbyHospitals = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          const latLng: LatLng = {
            latitude: location.lat(),
            longitude: location.lng()
          };
          const results = await searchHospitalsNearby(latLng.latitude, latLng.longitude);
          hospitals.value = results as Hospital[];
          updateMapMarkers();
        } else {
          throw new Error('Could not get current location.');
        }
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error('Error getting current location:', errorMessage);
        alert(errorMessage); // Show an alert to the user
      }
    };

    // Function to update map markers based on hospitals
    const updateMapMarkers = () => {
      if (!map) return;
      markers.forEach((marker) => marker.setMap(null));
      markers.length = 0;

      hospitals.value.forEach((hospital) => {
        const marker = new google.maps.Marker({
          position: { lat: hospital.location.latitude, lng: hospital.location.longitude },
          map: map!,
          title: hospital.name,
        });
        markers.push(marker);
      });
    };

    // Initialize Google Maps on component mount
    onMounted(() => {
      window.initMap = () => {
        map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
          center: { lat: 7.4417, lng: 3.9 }, // Default center if location is not available
          zoom: 8,
        });
        updateMapMarkers();
      };

      // Load Google Maps script if not already loaded
      if (!document.querySelector('script[src="https://maps.googleapis.com/maps/api/js"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error('Error loading Google Maps script');
          alert('Error loading Google Maps. Please try again later.');
        };
        document.head.appendChild(script);
      } else {
        window.initMap(); // Initialize the map if the script is already loaded
      }
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
  height: 200px; /* Adjusted to a more reasonable size */
}

input,
button {
  margin: 10px 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 20px 0;
}
</style>
