<template>
  <div>
    <h2>Sign Up</h2>
    <form @submit.prevent="handleSignUp">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerWithEmailAndPassword } from '@/auth';

export default defineComponent({
  name: 'SignUp',
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const handleSignUp = async () => {
      try {
        await registerWithEmailAndPassword(email.value, password.value);
        alert('User registered successfully!');
        router.push('/hospital-search');
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert('An unknown error occurred');
        }
      }
    };

    return {
      email,
      password,
      handleSignUp,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
