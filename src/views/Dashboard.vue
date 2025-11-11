<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-malachite-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-800">Registros Forestal</h1>
        </div>
        <button @click="logout" class="text-red-ribbon-50 hover:text-red-700 font-semibold transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Welcome Section -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Bienvenido, {{ userName }}</h2>
        <p class="text-gray-600 mt-1">Gestiona tus frentes y comprobantes</p>
      </div>

      <!-- Navigation Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <router-link v-if="isAdmin" to="/frentes" class="card group cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-malachite-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">Frentes</h3>
              <p class="text-gray-600">Gestionar frentes de trabajo</p>
            </div>
          </div>
        </router-link>

        <router-link to="/comprobantes" class="card group cursor-pointer">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-malachite-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">Comprobantes</h3>
              <p class="text-gray-600">Registrar y ver comprobantes</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-if="isAdmin" class="card">
          <p class="text-gray-600 text-sm mb-1">Total Frentes</p>
          <p class="text-3xl font-bold text-malachite-100">{{ stats.totalFrente }}</p>
        </div>
        <div class="card">
          <p class="text-gray-600 text-sm mb-1">Total Comprobantes</p>
          <p class="text-3xl font-bold text-malachite-100">{{ stats.totalComprobantes }}</p>
        </div>
        <div class="card">
          <p class="text-gray-600 text-sm mb-1">Gastado Este Mes</p>
          <p class="text-3xl font-bold text-blue-600">$ {{ formatMonto(stats.gastoMesActual) }}</p>
        </div>
        <div class="card">
          <p class="text-gray-600 text-sm mb-1">Sin Sincronizar</p>
          <p class="text-3xl font-bold text-golden-fizz-50">{{ stats.sinSincronizar }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AirtableService from '../services/airtable.js'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const userName = ref('')
    const isAdmin = ref(false)
    const stats = ref({
      totalFrente: 0,
      totalComprobantes: 0,
      gastoMesActual: 0,
      sinSincronizar: 0
    })

    const logout = () => {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('isAuthenticated')
      router.push('/login')
    }

    const formatMonto = (monto) => {
      return parseFloat(monto || 0).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const loadStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const isOnline = navigator.onLine

        // Cargar frentes
        const frentesResponse = await fetch('./data/frentes.json')
        const frentes = await frentesResponse.json()
        stats.value.totalFrente = frentes.filter(f => f.activo).length

        // Cargar comprobantes
        let comprobantes = []

        if (isOnline) {
          try {
            // Obtener comprobantes de Airtable (ya filtrados por usuario)
            const userName = user.nombre || null
            comprobantes = user.rol === 'admin' 
              ? await AirtableService.getComprobantes()
              : await AirtableService.getComprobantes(userName)
            
            // Agregar comprobantes locales no sincronizados
            const storedComprobantes = localStorage.getItem('comprobantes')
            const localComprobantes = storedComprobantes ? JSON.parse(storedComprobantes) : []
            const localNoSync = localComprobantes.filter(c => !c.sincronizado)
            
            comprobantes = [...comprobantes, ...localNoSync]
          } catch (error) {
            console.error('Error cargando desde Airtable:', error)
            // Si falla, usar localStorage
            const storedComprobantes = localStorage.getItem('comprobantes')
            comprobantes = storedComprobantes ? JSON.parse(storedComprobantes) : []
          }
        } else {
          // Sin conexión, usar localStorage
          const storedComprobantes = localStorage.getItem('comprobantes')
          comprobantes = storedComprobantes ? JSON.parse(storedComprobantes) : []
        }

        // Calcular estadísticas
        stats.value.totalComprobantes = comprobantes.length
        stats.value.sinSincronizar = comprobantes.filter(c => !c.sincronizado).length

        // Calcular gasto del mes actual
        const hoy = new Date()
        const mesActual = hoy.getMonth()
        const añoActual = hoy.getFullYear()

        const comprobantesDelMes = comprobantes.filter(c => {
          const fechaComprobante = new Date(c.fecha + 'T00:00:00')
          return fechaComprobante.getMonth() === mesActual && 
                 fechaComprobante.getFullYear() === añoActual
        })

        stats.value.gastoMesActual = comprobantesDelMes.reduce((total, c) => {
          return total + (parseFloat(c.monto) || 0)
        }, 0)

      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      }
    }

    onMounted(() => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
      userName.value = user.nombre || 'Usuario'
      isAdmin.value = user.rol === 'admin'
      loadStats()
    })

    return {
      userName,
      isAdmin,
      stats,
      logout,
      formatMonto
    }
  }
}
</script>
