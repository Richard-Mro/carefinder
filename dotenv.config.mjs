// dotenv.config.mjs
import dotenv from 'dotenv';

// Check if process is defined (Node.js environment)
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
  // Define Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    messagingSenderId: '938950238680',
    appId: '1:938950238680:web:f5c7afe07a0f9354d152ad'
    // Add other Firebase config properties
  };
  
  export default firebaseConfig;
} else {
  console.warn('dotenv.config.mjs: `process` is not defined. Skipping dotenv configuration.');
  export default {};
}
