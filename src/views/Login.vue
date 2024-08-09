<template>
  <div>
    <h2>Login</h2>
    <!-- Existing Email/Password Login Form -->
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button @click="login">Login</button>

    <!-- Social Media Login Buttons -->
    <button @click="loginWithGoogle">Login with Google</button>
    <button @click="loginWithFacebook">Login with Facebook</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, googleProvider, facebookProvider } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

export default defineComponent({
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    // Existing Email/Password Login Method
    const login = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push('/hospital-search');
      } catch (error) {
        handleAuthError(error);
      }
    };

    // Google Login Method
    const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    router.push('/hospital-search'); // Redirect after successful login
  } catch (error: unknown) {
    const err = error as FirebaseError;
    console.error('Error logging in with Google', err);
    alert(err.message);
  }
};

    // Facebook Login Method
    const loginWithFacebook = async () => {
  try {
    await signInWithPopup(auth, facebookProvider);
    router.push('/hospital-search'); // Redirect after successful login
  } catch (error: unknown) {
    const err = error as FirebaseError;
    console.error('Error logging in with Facebook', err);
    alert(err.message);
  }
};

    // Handle authentication errors
    const handleAuthError = (error: unknown) => {
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
    };

    return {
      email,
      password,
      login,
      loginWithGoogle,
      loginWithFacebook,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
