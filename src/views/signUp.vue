<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="handleSignUp" class="signup-form">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" class="btn-signup">Sign Up</button>
    </form>Already a User ? <router-link to="/login">Login</router-link>
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
        router.push('/request-admin');
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
/* Base styles for the container */
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: var(--color-background-soft);
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-heading);
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  border-color: var(--color-border-hover);
  outline: none;
}

button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.btn-signup {
  background-color: var(--color-heading);
  color: var(--color-background);
}

.btn-signup:hover {
  background-color: var(--color-heading-hover);
}

@media (max-width: 600px) {
  .signup-container {
    padding: 1rem;
  }
  
  input, button {
    font-size: 0.875rem;
  }
}
</style>
