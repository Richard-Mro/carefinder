<template>
  <div>
    <h2>Login</h2>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button @click="login">Login</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export default defineComponent({
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const login = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push('/hospital-search');
      } catch (error) {
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case 'auth/user-not-found':
              alert('User doesn\'t exist. Please sign up and create an account first.');
              break;
            case 'auth/wrong-password':
              alert('Incorrect password. Please try again.');
              break;
            case 'auth/invalid-email':
              alert('Invalid email. Please check your email and try again.');
              break;
            default:
              alert('An unknown error occurred. Please try again.');
          }
        } else {
          alert('An unexpected error occurred. Please try again.');
        }
      }
    };

    return {
      email,
      password,
      login,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
