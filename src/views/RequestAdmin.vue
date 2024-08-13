<template>
  <div class="request-admin">
    <h2>Request Admin Access</h2>
    <form @submit.prevent="submitRequest">
      <div>
        <label for="reason">Why do you want to become an admin?</label>
        <textarea id="reason" v-model="reason" required></textarea>
      </div>
      <button type="submit">Submit Request</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { db, auth } from '@/firebase'; // Adjust the import path if necessary
import { collection, addDoc } from 'firebase/firestore';

export default defineComponent({
  name: 'RequestAdmin',
  setup() {
    const reason = ref('');

    const submitRequest = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        await addDoc(collection(db, 'requests'), {
          userId: user.uid,
          email: user.email,
          reason: reason.value,
          status: 'pending', // Initial status
          createdAt: new Date(),
        });

        alert("Your request has been submitted. You will be notified once it is approved. Please you could log in again then to check if you've been approved to create hospital entries" );
      } catch (error) {
        console.error("Error submitting request: ", error);
        alert('An error occurred while submitting your request. Please try again later.');
      }
    };

    return {
      reason,
      submitRequest,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
