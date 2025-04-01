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
        @click="exportFilteredHospitalsHandler"
        class="action-button"
        :disabled="!isActionable"
      >
        Export to CSV
      </button>
      <button
        @click="generateShareableLinkForFilteredHospitalsHandler"
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
import { exportHospitals } from '@/services/exportHospitals';  // Ensure you have a correct exportHospitals service.
import { shareViaEmail } from '@/services/shareViaEmail';  // Ensure you have a correct shareViaEmail service.
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

    const nearbySearchPerformed = ref(false);

    const isActionable = computed(() => searchKeyword.value.trim().length > 0 || nearbySearchPerformed.value);

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

    // Function to check if the app is online or offline
    const isOnline = computed(() => navigator.onLine);

    // Function to save hospitals to IndexedDB
    const saveHospitalsToIndexedDB = (data: Hospital[]) => {
      const request = indexedDB.open('carefinder', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains('hospitals')) {
          db.createObjectStore('hospitals', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('hospitals', 'readwrite');
        const store = transaction.objectStore('hospitals');
        
        data.forEach(hospital => {
          store.put(hospital);
        });
      };
    };

    // Function to get hospitals from IndexedDB
    const getHospitalsFromIndexedDB = () => {
      return new Promise<Hospital[]>((resolve, reject) => {
        const request = indexedDB.open('carefinder', 1);

        request.onsuccess = (event) => {
          const db = (event.target as IDBRequest).result;
          const transaction = db.transaction('hospitals', 'readonly');
          const store = transaction.objectStore('hospitals');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };

          getAllRequest.onerror = () => {
            reject('Failed to fetch data from IndexedDB');
          };
        };

        request.onerror = () => {
          reject('Failed to open IndexedDB');
        };
      });
    };

    const performSearch = async () => {
      loading.value = true;
      try {
        if (isOnline.value) {
          const results = await searchHospitals(searchKeyword.value.toLowerCase());
          hospitals.value = results as Hospital[];
          saveHospitalsToIndexedDB(hospitals.value); // Save data to IndexedDB when online
        } else {
          const offlineData = await getHospitalsFromIndexedDB();
          hospitals.value = offlineData;
          alert('You are offline. Showing cached hospitals.');
        }
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
          saveHospitalsToIndexedDB(hospitals.value); // Save data to IndexedDB when online
          currentPage.value = 1;
          updateMapMarkers();
          nearbySearchPerformed.value = true;
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

    const exportFilteredHospitalsHandler = async () => {
      try {
        loading.value = true;
        const hospitalsData = filteredHospitals.value.map(hospital => ({
          id: hospital.id,
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          website: hospital.website,
        }));

        const response = await axios.post(
          'https://us-central1-carefinder-70ff2.cloudfunctions.net/exportHospitalsToCSV',
          { hospitals: hospitalsData },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.url) {
          window.open(response.data.url, '_blank');
        } else {
          console.error('Error: No URL returned from the server.');
        }
      } catch (error) {
        console.error('Error exporting hospitals:', error);
        alert('Failed to export hospitals.');
      } finally {
        loading.value = false;
      }
    };

    const generateShareableLinkForFilteredHospitalsHandler = async () => {
      loading.value = true;
      try {
        const hospitalsData = filteredHospitals.value.map(hospital => ({
          id: hospital.id,
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          website: hospital.website,
        }));

        const response = await axios.post('https://us-central1-carefinder-70ff2.cloudfunctions.net/generateShareableLinkForFilteredHospitals', {
          hospitals: hospitalsData,
        });

        const shareableLink = response.data.shortUrl;

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
        if (isOnline.value) {
          const results = await searchHospitals('');
          hospitals.value = results as Hospital[];
          saveHospitalsToIndexedDB(hospitals.value); // Save data when online
        } else {
          const offlineData = await getHospitalsFromIndexedDB();
          hospitals.value = offlineData;
          alert('You are offline. Showing cached hospitals.');
        }
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
      selectHospital,
      loading,
      currentPage,
      totalPages,
      prevPage,
      nextPage,
      exportFilteredHospitalsHandler, // Correct method name
      generateShareableLinkForFilteredHospitalsHandler, // Correct method name
      performSearch,
      searchNearbyHospitals,
      isActionable,
      selectedHospital,
    };
  }
});
</script>



<style scoped>
:root {
  /* Light mode colors */
  --color-primary: #3498db;
  --color-secondary: #2c3e50;
  --color-accent: #15ce0b;
  --color:white;
  --color-background-light: #f5f5f5;
  --color-background-card-light: #ffffff;
  --color-text-light: #333;
  --color-text-muted-light: #555;
  --color-border-light: #ddd;
  --color-shadow-light: rgba(0, 0, 0, 0.1);

  /* Dark mode colors */
  --color-background-dark: #2c2c2c;
  --color-dark: black;
  --color-background-card-dark: #3c3c3c;
  --color-text-dark: #ddd;
  --color-text-muted-dark: #aaa;
  --color-border-dark: #444;
  --color-shadow-dark: rgba(0, 0, 0, 0.5);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color:var(--color);
    --color-background-light: var(--color-background-dark);
    --color-background-card-light: var(--color-background-card-dark);
    --color-text-light: var(--color-text-dark);
    --color-text-muted-light: var(--color-text-muted-dark);
    --color-border-light: var(--color-border-dark);
    --color-shadow-light: var(--color-shadow-dark);
  }
}

.container {
  padding: 25px;
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
  border-top: 5px solid var(--color-primary);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Button styling */
.search-nearby-button {
  padding: 10px;
  background-color: var(--color-accent);
  color: var(--color);
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 15px;
  transition: background-color 0.3s ease;
}

.search-nearby-button:hover {
  background-color: darken(var(--color-accent), 10%);
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid var(--color-border-light);
  background-color: var(--color-background-card-light);
  color: var(--color-text-light);
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 10px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.action-button:hover:not(:disabled) {
  background-color: darken(var(--color-primary), 10%);
}

/* Hospital list and cards */
.hospital-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hospital-card {
  padding: 15px;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: var(--color-background-card-light);
  color: var(--color-text-light);
  box-shadow: 0 2px 8px var(--color-shadow-light);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  overflow: hidden;
  word-wrap: break-word;
}

.hospital-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px var(--color-shadow-light);
}

.hospital-card.selected {
  background-color: lighten(var(--color-primary), 40%);
}

.hospital-card h3 {
  font-size: 1.25em;
  margin-bottom: 10px;
}

.hospital-card p {
  margin: 5px 0;
  line-height: 1.4;
  color: var(--color-text-muted-light);
}

.hospital-card p span {
  font-weight: bold;
  color: var(--color-primary);
}

.hospital-card p.address {
  color: var(--color-secondary);
}

.hospital-card p.phone {
  color: var(--color-accent);
}

.hospital-card p.website {
  color: var(--color-primary);
}

.website-link {
  color: inherit;
  text-decoration: underline;
  word-break: break-word;
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
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: darken(var(--color-primary), 10%);
}

.map {
  height: 400px;
  border: 1px solid var(--color-border-light);
}
</style>
