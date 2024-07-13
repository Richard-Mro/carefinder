import './assets/main.css' // Import your CSS file

import { createApp } from 'vue' // Import Vue.js createApp function
import { createPinia } from 'pinia' // Import Pinia for state management
import App from './App.vue' // Import your main Vue component
import './firebase' // Import Firebase app instance

// Create a Vue.js application instance
const vueApp = createApp(App)

// Use Pinia for state management
vueApp.use(createPinia())

// Mount your Vue.js application to the DOM
vueApp.mount('#app')
