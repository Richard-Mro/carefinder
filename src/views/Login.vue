<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="login" class="login-form">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" class="btn-login">Login</button> 
    </form>

    <div ref="googleSignInButton" class="google-signin-button"></div>

    <button @click="loginWithGoogle" class="btn-google">
      Login with Google
    </button>
    <button @click="loginWithFacebook" class="btn-facebook">
      Login with Facebook
    </button> Not a User? <router-link to="/signup">SignUp</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, googleProvider, facebookProvider, db } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithCredential, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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

    const checkAdminStatus = async (uid: string) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        const isAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
        console.log("Admin check:", isAdmin); // Debugging line
        return isAdmin;
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    };

    const redirectToCorrectPage = async (uid: string) => {
      const isAdmin = await checkAdminStatus(uid);
      if (isAdmin) {
        router.push('/create-hospital');
      } else {
        router.push('/request-admin');
      }
    };

    const login = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        await redirectToCorrectPage(auth.currentUser?.uid || '');
      } catch (error) {
        handleAuthError(error);
      }
    };

    const loginWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          await signInWithCredential(auth, credential);
          await redirectToCorrectPage(auth.currentUser?.uid || '');
        }
      } catch (error: unknown) {
        handleAuthError(error);
      }
    };

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

    const handleGoogleCredentialResponse = async (response: any) => {
      try {
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(auth, credential);
        await redirectToCorrectPage(auth.currentUser?.uid || '');
      } catch (error: unknown) {
        handleAuthError(error);
      }
    };

    const loginWithFacebook = async () => {
      try {
        const result = await signInWithPopup(auth, facebookProvider);
        const credential = FacebookAuthProvider.credentialFromResult(result);
        if (credential) {
          await signInWithCredential(auth, credential);
          await redirectToCorrectPage(auth.currentUser?.uid || '');
        }
      } catch (error: unknown) {
        handleAuthError(error);
      }
    };

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
/* Base styles for the container */
.login-container {
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

.login-form {
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
  margin-left: 5px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.btn-login {
  background-color: var(--color-heading);
  color: var(--color-background);
}

.btn-login:hover {
  background-color: var(--color-heading-hover);
}

.btn-google {
  background-color: #4285f4;
  color: #fff;
}

.btn-google:hover {
  background-color: #357ae8;
}

.btn-facebook {
  background-color: #3b5998;
  color: #fff;
}

.btn-facebook:hover {
  background-color: #2d4373;
}

.google-signin-button {
  margin: 1rem 0;
}

@media (max-width: 600px) {
  .login-container {
    padding: 1rem;
  }
  
  input, button {
    font-size: 0.875rem;
  }
}
</style>
