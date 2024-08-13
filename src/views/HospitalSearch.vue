<template>
  <div class="container">
    <!-- Loading spinner -->
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
      <button @click="generateShareableLink" class="action-button">Generate Shareable Link</button>
    </div>

    <ul v-if="!loading" class="hospital-list">
      <li v-for="hospital in paginatedHospitals" :key="hospital.id" class="hospital-card">
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

    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditModal">&times;</span>
        <h2>Edit Markdown Content</h2>
        <textarea v-model="editedMarkdown" rows="10" cols="50"></textarea>
        <button @click="saveMarkdown" class="save-button">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { searchHospitals, searchHospitalsNearby, updateHospitalMarkdown } from '@/services/hospitalService';
import { getCurrentLocation } from '@/services/geolocationHelper';
import { Hospital } from '@/api/types';
import { exportHospitalsToCSV } from '@/utils/csvExporter';
import { downloadCSV } from '@/utils/fileDownloader';
import { generateShareableLink, composeEmailBody } from '@/utils/shareHelpers';
import * as marked from 'marked';

export default defineComponent({
  name: 'HospitalSearch',
  setup() {
    const searchKeyword = ref('');
    const hospitals = ref<Hospital[]>([]);
    const currentPage = ref(1);
    const hospitalsPerPage = 2;
    const map = ref<google.maps.Map | null>(null);
    const markers: google.maps.Marker[] = [];
    const showEditModal = ref(false);
    const editedMarkdown = ref('');
    const editingHospitalId = ref('');
    const loading = ref(false);

    const filteredHospitals = computed(() => {
      const keyword = searchKeyword.value.toLowerCase();
      return hospitals.value.filter(hospital =>
        hospital.name.toLowerCase().includes(keyword) ||
        hospital.address.toLowerCase().includes(keyword) ||
        (hospital.markdown && hospital.markdown.toLowerCase().includes(keyword))
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

    const performSearch = async () => {
      loading.value = true;
      try {
        const results = await searchHospitals(searchKeyword.value.toLowerCase());
        hospitals.value = results as Hospital[];
        currentPage.value = 1;
        updateMapMarkers();
      } catch (error) {
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
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error('Error getting current location:', errorMessage);
        alert(errorMessage);
      } finally {
        loading.value = false;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const updateMapMarkers = () => {
      if (!map.value) return;
      markers.forEach((marker) => marker.setMap(null));
      markers.length = 0;

      paginatedHospitals.value.forEach((hospital) => {
        const marker = new google.maps.Marker({
          position: { lat: hospital.location.latitude, lng: hospital.location.longitude },
          map: map.value,
          title: hospital.name,
        });
        markers.push(marker);
      });
    };

    const exportHospitals = () => {
      const csvContent = exportHospitalsToCSV(hospitals.value);
      downloadCSV('hospitals.csv', csvContent);
    };

    const shareViaEmail = () => {
      const emailBody = composeEmailBody(hospitals.value);
      const mailtoLink = `mailto:?subject=Hospital Information&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
    };

    const generateShareableLinkHandler = () => {
      const shareableLink = generateShareableLink(hospitals.value);
      navigator.clipboard.writeText(shareableLink).then(() => {
        alert('Shareable link copied to clipboard!');
      }, (err) => {
        console.error('Failed to copy shareable link: ', err);
      });
    };

    const hospitalContent = (markdown: string | undefined) => {
      return markdown ? marked.parse(markdown) : '';
    };

    const openEditModal = (hospital: Hospital) => {
      showEditModal.value = true;
      editedMarkdown.value = hospital.markdown;
      editingHospitalId.value = hospital.id;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editedMarkdown.value = '';
      editingHospitalId.value = '';
    };

    const saveMarkdown = async () => {
      try {
        await updateHospitalMarkdown(editingHospitalId.value, editedMarkdown.value);
        const hospital = hospitals.value.find(h => h.id === editingHospitalId.value);
        if (hospital) {
          hospital.markdown = editedMarkdown.value;
        }
        closeEditModal();
      } catch (error) {
        console.error('Error saving markdown:', error);
      }
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
        script.onerror = () => {
          console.error('Error loading Google Maps script');
          alert('Error loading Google Maps. Please try again later.');
        };
        document.head.appendChild(script);
      } else {
        window.initMap();
      }
    });

    return {
      searchKeyword,
      paginatedHospitals,
      currentPage,
      totalPages,
      performSearch,
      searchNearbyHospitals,
      prevPage,
      nextPage,
      exportHospitals,
      shareViaEmail,
      generateShareableLink: generateShareableLinkHandler,
      hospitalContent,
      showEditModal,
      editedMarkdown,
      openEditModal,
      closeEditModal,
      saveMarkdown,
      loading
    };
  }
});
</script>

<style scoped>
/* Container Styles */
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
  z-index: 999;
}

.spinner {
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid #ffffff;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Search Bar */
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.search-input {
  padding: 10px;
  font-size: 16px;
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-nearby-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-nearby-button:hover {
  background-color: #45a049;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.action-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #008CBA;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background-color: #007BB5;
}

/* Hospital List */
.hospital-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.hospital-card {
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.hospital-card h3 {
  margin: 0 0 10px;
}

.website-link {
  color: #007BB5;
}

.website-link:hover {
  text-decoration: underline;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #008CBA;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #007BB5;
}

/* Map */
.map {
  width: 100%;
  height: 400px;
  margin-top: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* Modal */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 100%;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
}

.save-button {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.save-button:hover {
  background-color: #45a049;
}
</style>
