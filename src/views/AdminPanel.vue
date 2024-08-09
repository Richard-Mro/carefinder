<template>
  <div>
    <h1>Admin Panel</h1>
    <ul>
      <li v-for="hospital in hospitals" :key="hospital.id">
        {{ hospital.name }}
        <button @click="deleteHospital(hospital.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { auth, db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface Hospital {
  id: string;
  name: string;
  [key: string]: any;
}

export default defineComponent({
  data() {
    return {
      hospitals: [] as Hospital[],
    };
  },
  async created() {
    const hospitalsSnapshot = await getDocs(collection(db, 'hospitals'));
    this.hospitals = hospitalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Hospital[];
  },
  methods: {
    async deleteHospital(hospitalId: string) {
      await deleteDoc(doc(db, 'hospitals', hospitalId));
      this.hospitals = this.hospitals.filter((hospital) => hospital.id !== hospitalId);
    },
  },
});
</script>
