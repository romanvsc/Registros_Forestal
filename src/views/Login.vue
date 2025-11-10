<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-malachite-50 to-malachite-100 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-malachite-100 rounded-full mb-4">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800">Forestal Paraguay</h1>
          <p class="text-gray-600 mt-2">Sistema de comprobantes</p>
        </div>

        <!-- Formulario de login -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Mensajes de error -->
          <div v-if="errorMessage" class="alert-danger">
            {{ errorMessage }}
          </div>

          <!-- Campo de usuario -->
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="input-field"
              placeholder="Ingrese su usuario"
              autocomplete="username"
            />
          </div>

          <!-- Campo de contraseña -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input-field"
              placeholder="Ingrese su contraseña"
              autocomplete="current-password"
            />
          </div>

          <!-- Botón de login -->
          <button
            type="submit"
            class="btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading">Iniciando sesión...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      errorMessage.value = ''
      loading.value = true

      try {
        // Cargar usuarios desde el archivo JSON
        const response = await fetch('./data/usuarios.json')
        const usuarios = await response.json()

        // Buscar usuario
        const user = usuarios.find(
          u => u.username === username.value && u.password === password.value
        )

        if (user) {
          // Guardar sesión en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user))
          localStorage.setItem('isAuthenticated', 'true')
          
          // Redirigir al dashboard
          router.push('/dashboard')
        } else {
          errorMessage.value = 'Usuario o contraseña incorrectos'
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error)
        errorMessage.value = 'Error al conectar con el servidor'
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      password,
      errorMessage,
      loading,
      handleLogin
    }
  }
}
</script>
