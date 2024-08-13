<template>
  <div>
    <h1>Admin Requests</h1>
    <ul>
      <li v-for="request in requests" :key="request.id">
        <p><strong>Email:</strong> {{ request.email }}</p>
        <p><strong>Reason:</strong> {{ request.reason }}</p>
        <p><strong>Status:</strong> {{ request.status }}</p>
        <p><strong>User ID:</strong> {{ request.userId }}</p>
        <button @click="approveRequest(request.id)">Approve</button>
        <button @click="denyRequest(request.id)">Deny</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface AdminRequest {
  id: string;
  userId: string;
  email: string;
  reason: string;
  status: string;
  createdAt: Date;
}

export default defineComponent({
  name: 'AdminRequests',
  setup() {
    const requests = ref<AdminRequest[]>([]);

    onMounted(async () => {
      const querySnapshot = await getDocs(collection(db, 'requests'));
      requests.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminRequest[];
    });

    const approveRequest = async (id: string) => {
      const requestDoc = doc(db, 'requests', id);
      await updateDoc(requestDoc, { status: 'approved' });
      alert('Request approved');
    };

    const denyRequest = async (id: string) => {
      const requestDoc = doc(db, 'requests', id);
      await updateDoc(requestDoc, { status: 'denied' });
      alert('Request denied');
    };

    return {
      requests,
      approveRequest,
      denyRequest,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
