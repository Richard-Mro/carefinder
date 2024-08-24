<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="handleSignUp" class="signup-form">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" class="btn-signup">Sign Up</button>
    </form>
    <p class="login-link">Already a User? <router-link to="/login">Login</router-link></p>
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
/* Light and Dark Mode Color Variables */
:root {
  --color-primary: #4CAF50;
  --color-primary-dark: #388E3C;
  --color-heading: #333;
  --color-background-soft: #f5f5f5;
  --color-border: #ccc;
  --color-border-hover: #bbb;
  --color-gradient-light: linear-gradient(135deg, #f8f9fa, #ffffff);
  --color-gradient-dark: linear-gradient(135deg, #2c3e50, #34495e);
  --color-input-background: #fff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #4CAF50;
    --color-primary-dark: #45a049;
    --color-heading: #ddd;
    --color-background-soft: #2c2c2c;
    --color-border: #444;
    --color-border-hover: #666;
    --color-input-background: #3c3c3c;
  }
}

/* Base styles for the container */
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  background: var(--color-gradient-light);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, background-color 0.3s;
}

@media (prefers-color-scheme: dark) {
  .signup-container {
    background: var(--color-gradient-dark);
  }
}

.signup-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-heading);
  font-weight: 600;
  font-size: 1.75rem;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-input-background);
  font-size: 1rem;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 8px rgba(0, 128, 0, 0.2);
  outline: none;
}

button {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s, color 0.3s, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.btn-signup {
  background-color: var(--color-primary);
  color: #ffffff;
}

.btn-signup:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 128, 0, 0.2);
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .signup-container {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  input, button {
    font-size: 0.875rem;
  }
}
</style>
