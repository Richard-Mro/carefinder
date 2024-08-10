<template>
  <div>
    <h2>Login</h2>
    <!-- Existing Email/Password Login Form -->
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button @click="login">Login</button>

    <!-- Google One-Tap Sign-In -->
    <div ref="googleSignInButton"></div>

    <!-- Traditional Google Login Button -->
    <button @click="loginWithGoogle">Login with Google</button>

    <!-- Facebook Login Button -->
    <button @click="loginWithFacebook">Login with Facebook</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, googleProvider, facebookProvider } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

declare global {
  interface Window {
    google: any;
  }
}

export default defineComponent({
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const googleSignInButton = ref<HTMLDivElement | null>(null);

    // Existing Email/Password Login Method
    const login = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push('/hospital-search');
      } catch (error) {
        handleAuthError(error);
      }
    };

    // Google Login Method (Traditional Button)
    const loginWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          await signInWithCredential(auth, credential);
          router.push('/hospital-search');
        }
      } catch (error: unknown) {
        handleAuthError(error);
      }
    };

    // Initialize Google One-Tap Sign-In
    onMounted(() => {
      if (window.google && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleCredentialResponse,
          cancel_on_tap_outside: false,
        });
        window.google.accounts.id.renderButton(googleSignInButton.value, {
          theme: 'outline',
          size: 'large',
        });
        window.google.accounts.id.prompt();
      }
    });

    // Handle Google Sign-In response
    const handleGoogleCredentialResponse = async (response: any) => {
      try {
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(auth, credential);
        router.push('/hospital-search');
      } catch (error: unknown) {
        handleAuthError(error);
      }
    };

    // Facebook Login Method
    const loginWithFacebook = async () => {
      try {
        const result = await signInWithPopup(auth, facebookProvider);
        const credential = FacebookAuthProvider.credentialFromResult(result);
        if (credential) {
          await signInWithCredential(auth, credential);
          router.push('/hospital-search');
        }
      } catch (error: unknown) {
        handleAuthError(error);
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
      googleSignInButton,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>
