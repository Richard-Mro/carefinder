<template>
  <div>
    <h2>Sign Up</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="signUp">Sign Up</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default defineComponent({
  name: 'SignUp',
  setup() {
    const email = ref('');
    const password = ref('');

    const signUp = async () => {
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        alert('User registered successfully!');
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
      signUp,
    };
  },
});
</script>