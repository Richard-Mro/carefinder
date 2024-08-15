<template>
  <div>
    <h1>Create Hospital Entry</h1>
    <form @submit.prevent="submitEntry">
      <input v-model="hospitalName" placeholder="Insert Hospital Name.." required />
      <MarkdownEditor v-model="hospitalDetails" />
      <button type="submit">Create</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import MarkdownEditor from '../components/MarkdownEditor.vue';

interface User {
  uid: string;
  email: string | null;
}

export default defineComponent({
  components: {
    MarkdownEditor
  },
  setup() {
    const hospitalName = ref('');
    const hospitalDetails = ref('');
    const currentUser = ref<User | null>(null);
    const router = useRouter();

    // Check current user when component mounts
    onMounted(() => {
      const user = auth.currentUser;
      if (user) {
        currentUser.value = { uid: user.uid, email: user.email };
      } else {
        currentUser.value = null;
      }
    });

    const submitEntry = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert('Please log in to create hospital entries.');
          return;
        }

        console.log('Current user:', user);

        const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(userQuery);

        let isAdmin = false;

        querySnapshot.forEach((doc) => {
          console.log('User document data:', doc.data());
          if (doc.data().role === 'admin') {
            isAdmin = true;
          }
        });

        if (isAdmin) {
          await addDoc(collection(db, 'hospitals'), {
            name: hospitalName.value,
            details: hospitalDetails.value,
            createdBy: user.uid,
            createdAt: new Date()
          });
          router.push('/create-hospital');
        } else {
          alert('You are not authorized to create hospital entries.');
        }
      } catch (error) {
        console.error('Error creating hospital entry:', error);
        alert('An error occurred while creating the hospital entry. Please try again.');
      }
    };

    return {
      hospitalName,
      hospitalDetails,
      currentUser,
      submitEntry
    };
  }
});
</script>
