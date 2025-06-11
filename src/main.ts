import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // Import the router

const app = createApp(App)

app.use(createPinia())
app.use(router) // Use the router

// Check if service workers are supported and register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registered with scope:', registration.scope)
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error)
      })
  })
}


app.mount('#app')
