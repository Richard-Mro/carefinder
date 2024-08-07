<template>
  <div>
    <input
      type="text"
      v-model="searchKeyword"
      @input="performSearch"
      placeholder="Search hospitals..."
    />
    <button @click="searchNearbyHospitals">Search Nearby Hospitals</button>
    <button @click="exportHospitals">Export to CSV</button>
    <button @click="shareViaEmail">Share via Email</button>
    <button @click="generateShareableLink">Generate Shareable Link</button>

    <ul>
      <li v-for="hospital in paginatedHospitals" :key="hospital.id" class="hospital-card">
        <h3>{{ hospital.name }}</h3>
        <p>Address: {{ hospital.address }}</p>
        <p>Phone: {{ hospital.phone }}</p>
        <p>Website: <a :href="hospital.website" target="_blank">{{ hospital.website }}</a></p>
        <div v-html="hospitalContent(hospital.markdown)"></div>

        <button @click="openEditModal(hospital)">Edit Markdown</button>

        <router-link :to="{ name: 'ViewHospitalEntry', params: { id: hospital.id } }">
          View Details
        </router-link>
      </li>
    </ul>

    <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
    <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>

    <div id="map" style="height: 500px; width: 100%;"></div>

    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditModal">&times;</span>
        <h2>Edit Markdown Content</h2>
        <textarea v-model="editedMarkdown" rows="10" cols="50"></textarea>
        <button @click="saveMarkdown">Save</button>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { searchHospitals, searchHospitalsNearby } from '@/services/hospitalService';
import { getCurrentLocation } from '@/services/geolocationHelper';
import { Hospital } from '@/api/types';
import { exportHospitalsToCSV } from '@/utils/csvExporter';
import { downloadCSV } from '@/utils/fileDownloader';
import { generateShareableLink, composeEmailBody } from '@/utils/shareHelpers';
import { updateHospitalMarkdown } from '@/services/hospitalService'; // Import the update function
import * as marked from 'marked';



export default defineComponent({
  name: 'HospitalSearch',
  setup() {
    const searchKeyword = ref('');
    const hospitals = ref<Hospital[]>([]);
    const currentPage = ref(1);
    const hospitalsPerPage = 10;
    let map: google.maps.Map | null = null;
    const markers: google.maps.Marker[] = [];
    const showEditModal = ref(false);
    const editedMarkdown = ref('');
    let editingHospitalId = '';

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
      try {
        const results = await searchHospitals(searchKeyword.value.toLowerCase());
        hospitals.value = results as Hospital[];
        currentPage.value = 1;
        updateMapMarkers();
      } catch (error) {
        console.error('Error searching hospitals:', error);
      }
    };

    const searchNearbyHospitals = async () => {
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
      if (!map) return;
      markers.forEach((marker) => marker.setMap(null));
      markers.length = 0;

      paginatedHospitals.value.forEach((hospital) => {
        const marker = new google.maps.Marker({
          position: { lat: hospital.location.latitude, lng: hospital.location.longitude },
          map: map!,
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
  console.log(mailtoLink);  // Log the link to verify
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
      editingHospitalId = hospital.id;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editedMarkdown.value = '';
      editingHospitalId = '';
    };

    const saveMarkdown = async () => {
      try {
        await updateHospitalMarkdown(editingHospitalId, editedMarkdown.value);
        const hospital = hospitals.value.find(h => h.id === editingHospitalId);
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
        map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
          center: { lat: 9.082, lng: 8.6753 },
          zoom: 6
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
      saveMarkdown
    };
  }
});
</script>


<style scoped>
.hospital-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>

