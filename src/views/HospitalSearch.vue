<template>
  <div class="container">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <div class="search-bar">
      <input
        type="text"
        v-model="searchKeyword"
        @input="performSearch"
        placeholder="Input Location..."
        class="search-input"
      />
      <button @click="searchNearbyHospitals" class="search-nearby-button">Search Nearby Hospitals</button>
    </div>

    <div class="action-buttons">
      <button @click="exportHospitals" class="action-button">Export to CSV</button>
      <button @click="shareViaEmail" class="action-button">Share via Email</button>
      <button
        v-if="selectedHospital"
        @click="generateShareableLink(selectedHospital)"
        class="action-button"
      >
        Generate Shareable Link
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
      console.log("Selected Hospital:", selectedHospital.value);
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
        const location = await getCurrentLocation();
        if (location) {
          const latLng = {
            latitude: location.lat(),
            longitude: location.lng()
          };
          const results = await searchHospitalsNearby(latLng.latitude, latLng.longitude);
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

    const exportHospitals = async () => {
      try {
        loading.value = true;
        const response = await axios.get('/exportHospitalsToCSV');
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = 'hospitals.csv';
        link.click();
      } catch (error: any) {
        console.error('Error exporting hospitals:', error);
      } finally {
        loading.value = false;
      }
    };

    const shareViaEmail = async () => {
      const email = prompt('Enter email address:');
      if (!email) return;

      const hospitalList = hospitals.value.map(hospital => hospital.name);

      try {
        loading.value = true;
        const response = await axios.post('http://localhost:3000/api/shareHospitalsViaEmail', { recipientEmail: email, hospitalList });
        console.log('Response from server:', response.data);
        alert('Email sent successfully.');
      } catch (error: any) {
        console.error('Error sharing hospitals via email:', error);
        alert('Failed to send email.');
      } finally {
        loading.value = false;
      }
    };

    const createDynamicLink = async (hospitalId: string) => {
      const apiKey = import.meta.env.VITE_APP_FIREBASE_API_KEY;

      const longDynamicLink = `https://carefinder-70ff2.web.app/hospitals/${hospitalId}`;

      try {
        const response = await axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`, {
          longDynamicLink: `${longDynamicLink}?apn=com.example.android&ibi=com.example.ios`,
          suffix: {
            option: 'SHORT'
          }
        });

        return response.data.shortLink;
      } catch (error) {
        console.error('Error creating dynamic link:', error);
        throw error;
      }
    };

    const generateShareableLinkHandler = async (hospital: Hospital) => {
      try {
        loading.value = true;

        const dynamicLink = await createDynamicLink(hospital.id);
        await navigator.clipboard.writeText(dynamicLink);
        alert('Shareable link copied to clipboard!');
      } catch (error: any) {
        console.error('Error generating shareable link:', error);
        alert('Failed to generate shareable link.');
      } finally {
        loading.value = false;
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
          zoom: 5.5
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
      exportHospitals,
      shareViaEmail,
      generateShareableLink: generateShareableLinkHandler,
      loading,
      prevPage,
      nextPage,
      selectHospital,
    };
  }
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

.search-nearby-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.search-nearby-button:hover {
  background-color: #2980b9;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.action-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.action-button:hover {
  background-color: #2980b9;
}

.hospital-list {
  list-style: none;
  padding: 0;
}

.hospital-card {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.hospital-card:hover {
  background-color: #f5f5f5;
}

.hospital-card.selected {
  background-color: #e0f7fa;
}

.website-link {
  color: #3498db;
}

.website-link:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination-button {
  padding: 10px 20px;
  background-color: #3498db;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.map {
  height: 400px;
  width: 100%;
  margin-top: 20px;
  border-radius: 5px;
  border: 1px solid #ddd;
}
</style>

