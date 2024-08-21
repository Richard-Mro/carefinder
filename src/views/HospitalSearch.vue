<template>
  <div class="container">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Reposition the Search Nearby Hospitals button above the search input -->
    <button @click="searchNearbyHospitals" class="search-nearby-button">
      Click to Search Hospitals Near You
    </button>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchKeyword"
        @input="performSearch"
        placeholder="Input your preferred Location or State..."
        class="search-input"
      />
    </div>

    <div class="action-buttons">
      <button
        @click="exportHospitals"
        class="action-button"
        :disabled="!isActionable"
      >
        Export to CSV
      </button>
      <button
        @click="shareViaEmail"
        class="action-button"
        :disabled="!isActionable"
      >
        Share via Email
      </button>
      <button
        @click="generateShareableLinkForFilteredHospitalsHandler"
        class="action-button"
        :disabled="!isActionable"
      >
        Generate Shareable Link for Filtered Hospitals
      </button>
    </div>

    <ul v-if="!loading" class="hospital-list">
      <li
        v-for="hospital in paginatedHospitals"
        :key="hospital.id"
        class="hospital-card"
        @click="selectHospital(hospital)"
        :class="{ selected: hospital === selectedHospital }"
      >
        <h3>{{ hospital.name }}</h3>
        <p>ADDRESS: {{ hospital.address }}</p>
        <p>PHONE-NO: {{ hospital.phone }}</p>
        <p>WEBSITE: <a :href="hospital.website" target="_blank" class="website-link">{{ hospital.website }}</a></p>
      </li>
    </ul>

    <div v-if="!loading" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-button">Previous</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button">Next</button>
    </div>

    <div id="map" class="map"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { searchHospitals, searchHospitalsNearby } from '@/services/hospitalService';
import { getCurrentLocation } from '@/services/geolocationHelper';
import { Hospital } from '@/api/types';
import { exportHospitals } from '@/services/exportHospitals';
import { shareViaEmail } from '@/services/shareViaEmail';
import axios from 'axios';

export default defineComponent({
  name: 'HospitalSearch',
  setup() {
    const searchKeyword = ref('');
    const hospitals = ref<Hospital[]>([]);
    const selectedHospital = ref<Hospital | null>(null);
    const currentPage = ref(1);
    const hospitalsPerPage = 2;
    const loading = ref(false);
    const map = ref<google.maps.Map | null>(null);
    const markers: google.maps.Marker[] = [];
    const location = ref<{ latitude: number; longitude: number } | null>(null);

    const isActionable = computed(() => searchKeyword.value.trim().length > 0);

    const filteredHospitals = computed(() => {
      const keyword = searchKeyword.value.toLowerCase();
      return hospitals.value.filter(hospital =>
        hospital.name.toLowerCase().includes(keyword) ||
        hospital.address.toLowerCase().includes(keyword)
      );
    });

    const paginatedHospitals = computed(() => {
      const start = (currentPage.value - 1) * hospitalsPerPage;
      const end = start + hospitalsPerPage;
      return filteredHospitals.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredHospitals.value.length / hospitalsPerPage);
    });

    const selectHospital = (hospital: Hospital) => {
      selectedHospital.value = hospital;
    };

    const performSearch = async () => {
      loading.value = true;
      try {
        const results = await searchHospitals(searchKeyword.value.toLowerCase());
        hospitals.value = results as Hospital[];
        currentPage.value = 1;
        updateMapMarkers();
      } catch (error: any) {
        console.error('Error searching hospitals:', error);
      } finally {
        loading.value = false;
      }
    };

    const searchNearbyHospitals = async () => {
      loading.value = true;
      try {
        const loc = await getCurrentLocation();
        if (loc) {
          location.value = {
            latitude: loc.lat(),
            longitude: loc.lng(),
          };
          const results = await searchHospitalsNearby(location.value.latitude, location.value.longitude);
          hospitals.value = results as Hospital[];
          currentPage.value = 1;
          updateMapMarkers();
        } else {
          throw new Error('Could not get current location.');
        }
      } catch (error: any) {
        console.error('Error searching nearby hospitals:', error);
        alert(error.message);
      } finally {
        loading.value = false;
      }
    };

    const exportHospitalsHandler = async () => {
      try {
        loading.value = true;
        await exportHospitals();
      } catch (error) {
        alert('Failed to export hospitals.');
      } finally {
        loading.value = false;
      }
    };

    const shareViaEmailHandler = async () => {
      const email = prompt('Enter email address:');
      if (!email) return;

      const hospitalList = hospitals.value.map(hospital => hospital.name);

      try {
        loading.value = true;
        const message = await shareViaEmail(email, hospitalList);
        alert(message);
      } catch (error: any) {
        alert(error.message);
      } finally {
        loading.value = false;
      }
    };

    const generateShareableLinkForFilteredHospitalsHandler = async () => {
      loading.value = true;
      try {
        // Prepare the data you need to send to the backend
        const hospitalsData = filteredHospitals.value.map(hospital => ({
          id: hospital.id,
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          website: hospital.website,
        }));

        // Send a POST request to your backend to generate the shareable link
        const response = await axios.post('https://us-central1-carefinder-70ff2.cloudfunctions.net/generateShareableLinkForFilteredHospitals', {
          hospitals: hospitalsData,
        });

        // Assuming your backend returns the short URL
        const shareableLink = response.data.shortUrl;

        // Copy the link to the clipboard
        await copyToClipboard(shareableLink);
        alert('Shareable link copied to clipboard!');
      } catch (error) {
        console.error('Error generating shareable link for filtered hospitals:', error);
        alert('Failed to generate shareable link.');
      } finally {
        loading.value = false;
      }
    };

    const copyToClipboard = async (text: string) => {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API not supported');
      }
    };
    const updateMapMarkers = () => {
      if (!map.value) return;
      markers.forEach(marker => marker.setMap(null));
      markers.length = 0;

      paginatedHospitals.value.forEach(hospital => {
        const marker = new google.maps.Marker({
          position: { lat: hospital.location.latitude, lng: hospital.location.longitude },
          map: map.value,
          title: hospital.name,
        });
        markers.push(marker);
      });
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    onMounted(async () => {
      try {
        const results = await searchHospitals('');
        hospitals.value = results as Hospital[];
        updateMapMarkers();
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }

      window.initMap = () => {
        map.value = new google.maps.Map(document.getElementById('map') as HTMLElement, {
          center: { lat: 9.082, lng: 8.6753 },
          zoom: 5.5,
        });
        updateMapMarkers();
      };

      if (!document.querySelector('script[src="https://maps.googleapis.com/maps/api/js"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        window.initMap();
      }
    });

    return {
      searchKeyword,
      paginatedHospitals,
      selectedHospital,
      currentPage,
      totalPages,
      performSearch,
      searchNearbyHospitals,
      exportHospitals: exportHospitalsHandler,
      shareViaEmail: shareViaEmailHandler,
      generateShareableLinkForFilteredHospitalsHandler,
      loading,
      prevPage,
      nextPage,
      selectHospital,
      isActionable,
    };
  },
});
</script>

<style scoped>
.container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  border: 5px solid #f3f3f3;
  border-radius: 50%;
  border-top: 5px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Make the Search Nearby Hospitals button stand out */
.search-nearby-button {
  padding: 10px;
  background-color: #f39c12; /* Orange color */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 15px;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.action-button:disabled {
  background-color: #ccc; /* Light gray */
  color: #666; /* Dark gray */
  cursor: not-allowed;
}

.hospital-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hospital-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
}

.hospital-card.selected {
  background-color: #eaf4ff;
}

.website-link {
  color: #3498db;
  text-decoration: none;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-info {
  font-size: 14px;
  font-weight: bold;
}

.pagination-button {
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-button:disabled {
  background-color: #ccc; /* Light gray */
  color: #666; /* Dark gray */
  cursor: not-allowed;
}

.map {
  height: 400px;
  border: 1px solid #ddd;
}
</style>
