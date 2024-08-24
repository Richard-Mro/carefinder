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
      <i class="fab fa-google"></i> Login with Google
    </button>
    <button @click="loginWithFacebook" class="btn-facebook">
      <i class="fab fa-facebook-f"></i> Login with Facebook
    </button>

    <p class="signup-link">
      Not a User? <router-link to="/signup">Sign Up</router-link>
    </p>
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
.login-container {
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
  .login-container {
    background: var(--color-gradient-dark);
  }
}

.login-container:hover {
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

.login-form {
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

button i {
  margin-right: 0.5rem;
}

.btn-login {
  background-color: var(--color-primary);
  color: #ffffff;
}

.btn-login:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 128, 0, 0.2);
}

.btn-google {
  background: linear-gradient(45deg, #4285f4, #34a853, #fbbc05, #ea4335);
  color: #fff;
}

.btn-google:hover {
  background: linear-gradient(45deg, #357ae8, #2a9d3b, #e0a200, #d8453a);
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(66, 133, 244, 0.2);
}

.btn-facebook {
  background: linear-gradient(45deg, #3b5998, #8b9dc3);
  color: #fff;
}

.btn-facebook:hover {
  background: linear-gradient(45deg, #2d4373, #6d84b4);
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(59, 89, 152, 0.2);
}

.google-signin-button {
  margin: 1rem 0;
}

.signup-link {
  text-align: center;
  margin-top: 1rem;
}

.signup-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}

@media (max-width: 400px) {
  .login-container {
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
