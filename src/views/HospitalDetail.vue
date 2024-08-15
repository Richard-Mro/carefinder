<template>
  <div v-if="hospital">
    <h1>{{ hospital.name }}</h1>
    <p>{{ hospital.address }}</p>
    <p>{{ hospital.phone }}</p>
    <p><a :href="hospital.website" target="_blank">{{ hospital.website }}</a></p>
  </div>
  <p v-else>Loading...</p>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Hospital } from '@/api/types';
import { getHospitalById } from '@/services/hospitalService'; // Adjust import as needed

export default defineComponent({
  name: 'HospitalDetail',
  setup() {
    const route = useRoute();
    const hospital = ref<Hospital | null>(null);


    onMounted(async () => {
      const hospitalId = route.params.id as string;
      hospital.value = await getHospitalById(hospitalId);
    });

    return {
      hospital,
    };
  },
});
</script>
