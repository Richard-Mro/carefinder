<template>
  <div class="filtered-hospitals">
    <h2>Filtered Hospitals</h2>
    <ul class="hospital-list">
      <li v-for="hospital in hospitals" :key="hospital.id" class="hospital-card">
        <h3>{{ hospital.name }}</h3>
        <p>ADDRESS: {{ hospital.address }}</p>
        <p>PHONE-NO: {{ hospital.phone }}</p>
        <p>WEBSITE: <a :href="hospital.website" target="_blank">{{ hospital.website }}</a></p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Hospital } from '@/api/types';

export default defineComponent({
  name: 'FilteredHospitals',
  props: {
    data: {
      type: Array as PropType<Hospital[]>,
      default: () => []
    }
  },
  computed: {
    hospitals() {
      return this.data;
    }
  },
  created() {
    // Decode the data if necessary
    if (typeof this.data === 'string') {
      try {
        const decodedData = decodeURIComponent(this.data);
        this.hospitals = JSON.parse(decodedData);
      } catch (e) {
        console.error('Failed to parse hospitals data:', e);
      }
    }
  }
});
</script>

<style scoped>
.filtered-hospitals {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.hospital-list {
  list-style: none;
  padding: 0;
}

.hospital-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  width: 100%;
  max-width: 600px;
}

.website-link {
  color: #007bff;
  text-decoration: none;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
