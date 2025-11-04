import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado:', registration)
      })
      .catch(error => {
        console.log('Error al registrar Service Worker:', error)
      })
  })
}

const app = createApp(App)
app.use(router)
app.mount('#app')
