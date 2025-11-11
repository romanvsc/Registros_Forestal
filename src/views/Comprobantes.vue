<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button @click="goBack" class="text-gray-600 hover:text-gray-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold text-gray-800">Comprobantes</h1>
        </div>
        <button @click="showModal = true" class="btn-primary flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Nuevo</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Indicador de estado de conexión -->
      <div v-if="!isOnline" class="alert-warning mb-4">
        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path>
        </svg>
        Sin conexión - Los comprobantes se guardarán localmente
      </div>

      <!-- Filtro por Frente -->
      <div v-if="currentUser?.rol === 'admin'" class="mb-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Frente</label>
        <select v-model="filtroFrente" class="input-field">
          <option value="">Todos los frentes</option>
          <option v-for="frente in frentes" :key="frente.id" :value="frente.id">
            {{ frente.nombre }}
          </option>
        </select>
      </div>

      <!-- Lista de Comprobantes -->
      <div v-if="comprobantesFiltrados.length > 0" class="space-y-4">
        <div v-for="comprobante in comprobantesFiltrados" :key="comprobante.id" class="card">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <h3 class="text-lg font-bold text-gray-800">{{ comprobante.numeroFactura }}</h3>
                <span
                  v-if="!comprobante.sincronizado"
                  class="bg-golden-fizz-50 text-golden-fizz-100 px-2 py-1 rounded-full text-xs font-semibold"
                >
                  Sin sincronizar
                </span>
              </div>
              <p class="text-gray-600 text-sm">{{ comprobante.detalle }}</p>
              <div class="mt-2 space-y-1 text-sm text-gray-600">
                <p><strong>Fecha:</strong> {{ formatDate(comprobante.fecha) }}</p>
                <p><strong>Frente:</strong> {{ getFrenteNombre(comprobante.frenteId) }}</p>
                <p><strong>RUC:</strong> {{ comprobante.ruc }}</p>
                <p class="text-lg font-bold text-malachite-100">$ {{ formatMonto(comprobante.monto) }}</p>
              </div>
            </div>
            <button
              @click="confirmDelete(comprobante)"
              class="p-2 text-red-ribbon-50 hover:bg-red-50 rounded-lg transition-colors ml-4"
              title="Eliminar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-gray-600 mt-4">No hay comprobantes registrados</p>
        <button @click="showModal = true" class="btn-primary mt-4">Crear el primer comprobante</button>
      </div>

      <!-- Botón Sincronizar -->
      <div v-if="comprobantesNoSincronizados > 0" class="mt-6">
        <button 
          @click="sincronizar" 
          :disabled="syncing || !isOnline"
          class="btn-primary w-full flex items-center justify-center space-x-2"
          :class="{ 'opacity-50 cursor-not-allowed': syncing || !isOnline }"
        >
          <svg class="w-5 h-5" :class="{ 'animate-spin': syncing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span v-if="syncing">Sincronizando...</span>
          <span v-else>Sincronizar {{ comprobantesNoSincronizados }} comprobante(s)</span>
        </button>
      </div>
    </main>

    <!-- Modal Crear Comprobante -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 my-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Nuevo Comprobante</h2>
        
        <form @submit.prevent="saveComprobante" class="space-y-4">
          <!-- Mensajes de error -->
          <div v-if="errorMessage" class="alert-danger">
            {{ errorMessage }}
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
            <input
              v-model="form.fecha"
              type="date"
              required
              class="input-field"
              :max="today"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Detalle *</label>
            <textarea
              v-model="form.detalle"
              rows="3"
              required
              class="input-field"
              placeholder="Descripción del comprobante"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Frente *</label>
            <select v-model="form.frenteId" required class="input-field" :disabled="currentUser?.rol !== 'admin'">
              <option value="">Seleccione un frente</option>
              <option v-for="frente in frentesActivos" :key="frente.id" :value="frente.id">
                {{ frente.nombre }}
              </option>
            </select>
            <p v-if="currentUser?.rol !== 'admin'" class="text-xs text-gray-500 mt-1">
              Asignado a: {{ getFrenteNombre(currentUser?.frenteId) }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">RUC (CUIT) *</label>
            <input
              v-model="form.ruc"
              type="text"
              required
              pattern="[0-9]{11}"
              maxlength="11"
              class="input-field"
              placeholder="20123456789"
              @input="validateRuc"
            />
            <p class="text-xs text-gray-500 mt-1">11 dígitos numéricos</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Factura *</label>
            <div class="flex space-x-2">
              <input
                v-model="facturaParte1"
                type="text"
                required
                pattern="[0-9]{3}"
                maxlength="3"
                class="input-field w-20"
                placeholder="001"
                @input="validateFactura"
              />
              <span class="flex items-center text-gray-500">-</span>
              <input
                v-model="facturaParte2"
                type="text"
                required
                pattern="[0-9]{3}"
                maxlength="3"
                class="input-field w-20"
                placeholder="001"
                @input="validateFactura"
              />
              <span class="flex items-center text-gray-500">-</span>
              <input
                v-model="facturaParte3"
                type="text"
                required
                pattern="[0-9]{8}"
                maxlength="8"
                class="input-field flex-1"
                placeholder="00000001"
                @input="validateFactura"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Formato: XXX-XXX-XXXXXXXX</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Monto *</label>
            <input
              v-model="form.monto"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-field"
              placeholder="0.00"
            />
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar Eliminación -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Confirmar Eliminación</h2>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el comprobante "{{ comprobanteToDelete?.numeroFactura }}"?
        </p>
        <div class="flex space-x-3">
          <button @click="showDeleteModal = false" class="btn-secondary flex-1">
            Cancelar
          </button>
          <button @click="deleteComprobante" class="btn-danger flex-1">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Resultado Sincronización -->
    <div v-if="showSyncResult" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Resultado de Sincronización</h2>
        <div class="space-y-2">
          <p class="text-green-600">✓ Sincronizados: {{ syncResult.success }}</p>
          <p v-if="syncResult.errors > 0" class="text-red-600">✗ Errores: {{ syncResult.errors }}</p>
        </div>
        <button @click="showSyncResult = false" class="btn-primary w-full mt-4">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AirtableService from '../services/airtable.js'

export default {
  name: 'ComprobantesView',
  setup() {
    const router = useRouter()
    const comprobantes = ref([])
    const frentes = ref([])
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const showSyncResult = ref(false)
    const comprobanteToDelete = ref(null)
    const errorMessage = ref('')
    const filtroFrente = ref('')
    const isOnline = ref(navigator.onLine)
    const syncing = ref(false)
    const syncResult = ref({ success: 0, errors: 0 })
    const currentUser = ref(null)
    
    const facturaParte1 = ref('')
    const facturaParte2 = ref('')
    const facturaParte3 = ref('')
    
    const form = ref({
      fecha: new Date().toISOString().split('T')[0],
      detalle: '',
      frenteId: '',
      ruc: '',
      numeroFactura: '',
      monto: 0,
      sincronizado: false
    })

    const today = computed(() => new Date().toISOString().split('T')[0])

    const frentesActivos = computed(() => {
      // Si es admin, mostrar todos los frentes
      if (currentUser.value?.rol === 'admin') {
        return frentes.value.filter(f => f.activo)
      }
      // Si es usuario regular, solo mostrar su frente
      if (currentUser.value?.frenteId) {
        return frentes.value.filter(f => f.activo && f.id === currentUser.value.frenteId)
      }
      return []
    })

    const comprobantesFiltrados = computed(() => {
      let filtered = comprobantes.value

      // Si es admin y seleccionó un frente específico, filtrar por ese frente
      if (currentUser.value?.rol === 'admin' && filtroFrente.value) {
        filtered = filtered.filter(c => c.frenteId === filtroFrente.value)
      }

      // Para usuarios regulares, los comprobantes ya vienen filtrados desde Airtable
      // No necesitamos filtrar por frente aquí

      return filtered
    })

    const comprobantesNoSincronizados = computed(() => {
      return comprobantes.value.filter(c => !c.sincronizado).length
    })

    // Detectar cambios en la conexión
    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine
      if (isOnline.value) {
        console.log('Conexión restaurada')
      }
    }

    const goBack = () => {
      router.push('/dashboard')
    }

    const loadData = async () => {
      try {
        // Obtener usuario actual
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
        currentUser.value = user

        // Cargar frentes
        const storedFrente = localStorage.getItem('frentes')
        if (storedFrente) {
          frentes.value = JSON.parse(storedFrente)
        } else {
          const frentesResponse = await fetch('./data/frentes.json')
          frentes.value = await frentesResponse.json()
          localStorage.setItem('frentes', JSON.stringify(frentes.value))
        }

        // Si es usuario regular, preseleccionar su frente en el formulario
        if (user.rol !== 'admin' && user.frenteId) {
          form.value.frenteId = user.frenteId
        }

        // Si está online, cargar desde Airtable
        if (isOnline.value) {
          try {
            // Obtener el nombre del usuario para filtrar
            const userName = user.nombre || null
            
            // Si es admin, traer todos los comprobantes (sin filtro)
            // Si es usuario regular, filtrar por su nombre
            const airtableComprobantes = user.rol === 'admin' 
              ? await AirtableService.getComprobantes()
              : await AirtableService.getComprobantes(userName)
            
            // Solo mantener los comprobantes locales que NO están sincronizados
            const storedComprobantes = localStorage.getItem('comprobantes')
            const localComprobantes = storedComprobantes ? JSON.parse(storedComprobantes) : []
            const localNoSync = localComprobantes.filter(c => !c.sincronizado)
            
            // Combinar: comprobantes de Airtable + locales no sincronizados
            comprobantes.value = [...airtableComprobantes, ...localNoSync]
            
            // Actualizar el caché con los datos de Airtable
            localStorage.setItem('comprobantes', JSON.stringify(comprobantes.value))
          } catch (error) {
            console.error('Error cargando desde Airtable:', error)
            // Si falla Airtable, cargar desde caché local
            const storedComprobantes = localStorage.getItem('comprobantes')
            if (storedComprobantes) {
              comprobantes.value = JSON.parse(storedComprobantes)
            }
          }
        } else {
          // Sin conexión: cargar solo desde caché local
          const storedComprobantes = localStorage.getItem('comprobantes')
          if (storedComprobantes) {
            comprobantes.value = JSON.parse(storedComprobantes)
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }

    const validateRuc = (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '')
    }

    const validateFactura = (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '')
    }

    const closeModal = () => {
      showModal.value = false
      errorMessage.value = ''
      form.value = {
        fecha: new Date().toISOString().split('T')[0],
        detalle: '',
        frenteId: '',
        ruc: '',
        numeroFactura: '',
        monto: 0,
        sincronizado: false
      }
      facturaParte1.value = ''
      facturaParte2.value = ''
      facturaParte3.value = ''
    }

    const saveComprobante = async () => {
      errorMessage.value = ''

      // Validar RUC
      if (form.value.ruc.length !== 11) {
        errorMessage.value = 'El RUC debe tener 11 dígitos'
        return
      }

      // Validar y construir número de factura
      if (facturaParte1.value.length !== 3 || 
          facturaParte2.value.length !== 3 || 
          facturaParte3.value.length !== 8) {
        errorMessage.value = 'El número de factura debe seguir el formato XXX-XXX-XXXXXXXX'
        return
      }

      form.value.numeroFactura = `${facturaParte1.value}-${facturaParte2.value}-${facturaParte3.value}`

      // Validar monto
      if (form.value.monto <= 0) {
        errorMessage.value = 'El monto debe ser mayor a 0'
        return
      }

      try {
        let nuevoComprobante

        if (isOnline.value) {
          // Si está online, intentar guardar directamente en Airtable
          try {
            nuevoComprobante = await AirtableService.createComprobante({
              ...form.value,
              frenteId: parseInt(form.value.frenteId)
            })
            
            // Si se guardó exitosamente en Airtable, recargar datos
            await loadData()
            closeModal()
            return
          } catch (error) {
            console.error('Error guardando en Airtable:', error)
            // Si falla, guardar localmente
            nuevoComprobante = {
              ...form.value,
              id: `local_${Date.now()}`,
              frenteId: parseInt(form.value.frenteId),
              sincronizado: false
            }
          }
        } else {
          // Si está offline, guardar localmente
          nuevoComprobante = {
            ...form.value,
            id: `local_${Date.now()}`,
            frenteId: parseInt(form.value.frenteId),
            sincronizado: false
          }
        }

        comprobantes.value.push(nuevoComprobante)
        localStorage.setItem('comprobantes', JSON.stringify(comprobantes.value))
        closeModal()
      } catch (error) {
        errorMessage.value = 'Error al guardar el comprobante'
        console.error(error)
      }
    }

    const confirmDelete = (comprobante) => {
      comprobanteToDelete.value = comprobante
      showDeleteModal.value = true
    }

    const deleteComprobante = async () => {
      const comprobante = comprobanteToDelete.value

      // Si está sincronizado y online, eliminar de Airtable
      if (comprobante.sincronizado && isOnline.value && !comprobante.id.startsWith('local_')) {
        try {
          await AirtableService.deleteComprobante(comprobante.id)
        } catch (error) {
          console.error('Error eliminando de Airtable:', error)
        }
      }

      // Eliminar localmente
      comprobantes.value = comprobantes.value.filter(c => c.id !== comprobante.id)
      localStorage.setItem('comprobantes', JSON.stringify(comprobantes.value))
      showDeleteModal.value = false
      comprobanteToDelete.value = null
    }

    const sincronizar = async () => {
      if (!isOnline.value) {
        alert('No hay conexión a internet')
        return
      }

      syncing.value = true
      const noSincronizados = comprobantes.value.filter(c => !c.sincronizado)

      try {
        const results = await AirtableService.syncComprobantes(noSincronizados)
        
        // Mostrar resultado
        syncResult.value = {
          success: results.success.length,
          errors: results.errors.length
        }
        showSyncResult.value = true

        // Recargar datos desde Airtable para evitar duplicados
        await loadData()
      } catch (error) {
        console.error('Error sincronizando:', error)
        alert('Error al sincronizar los comprobantes')
      } finally {
        syncing.value = false
      }
    }

    const getFrenteNombre = (frenteId) => {
      const frente = frentes.value.find(f => f.id === frenteId)
      return frente ? frente.nombre : 'Sin frente'
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString + 'T00:00:00')
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    const formatMonto = (monto) => {
      return parseFloat(monto).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    onMounted(() => {
      loadData()
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
    })

    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    })

    return {
      comprobantes,
      frentes,
      showModal,
      showDeleteModal,
      showSyncResult,
      comprobanteToDelete,
      errorMessage,
      filtroFrente,
      isOnline,
      syncing,
      syncResult,
      currentUser,
      form,
      today,
      frentesActivos,
      comprobantesFiltrados,
      comprobantesNoSincronizados,
      facturaParte1,
      facturaParte2,
      facturaParte3,
      goBack,
      validateRuc,
      validateFactura,
      closeModal,
      saveComprobante,
      confirmDelete,
      deleteComprobante,
      sincronizar,
      getFrenteNombre,
      formatDate,
      formatMonto
    }
  }
}
</script>
