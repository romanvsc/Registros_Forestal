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
      <!-- Filtro por Frente -->
      <div class="mb-6">
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
        <button @click="sincronizar" class="btn-primary w-full flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Sincronizar {{ comprobantesNoSincronizados }} comprobante(s)</span>
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
            <select v-model="form.frenteId" required class="input-field">
              <option value="">Seleccione un frente</option>
              <option v-for="frente in frentesActivos" :key="frente.id" :value="frente.id">
                {{ frente.nombre }}
              </option>
            </select>
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ComprobantesView',
  setup() {
    const router = useRouter()
    const comprobantes = ref([])
    const frentes = ref([])
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const comprobanteToDelete = ref(null)
    const errorMessage = ref('')
    const filtroFrente = ref('')
    
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
      return frentes.value.filter(f => f.activo)
    })

    const comprobantesFiltrados = computed(() => {
      if (!filtroFrente.value) return comprobantes.value
      return comprobantes.value.filter(c => c.frenteId === filtroFrente.value)
    })

    const comprobantesNoSincronizados = computed(() => {
      return comprobantes.value.filter(c => !c.sincronizado).length
    })

    const goBack = () => {
      router.push('/dashboard')
    }

    const loadData = async () => {
      try {
        // Cargar frentes
        const storedFrente = localStorage.getItem('frentes')
        if (storedFrente) {
          frentes.value = JSON.parse(storedFrente)
        } else {
          const frentesResponse = await fetch('/data/frentes.json')
          frentes.value = await frentesResponse.json()
          localStorage.setItem('frentes', JSON.stringify(frentes.value))
        }

        // Cargar comprobantes
        const storedComprobantes = localStorage.getItem('comprobantes')
        if (storedComprobantes) {
          comprobantes.value = JSON.parse(storedComprobantes)
        } else {
          const comprobantesResponse = await fetch('/data/comprobantes.json')
          comprobantes.value = await comprobantesResponse.json()
          localStorage.setItem('comprobantes', JSON.stringify(comprobantes.value))
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

    const saveComprobante = () => {
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

      // Crear nuevo comprobante
      const newId = comprobantes.value.length > 0 
        ? Math.max(...comprobantes.value.map(c => c.id)) + 1 
        : 1
      
      comprobantes.value.push({ 
        ...form.value, 
        id: newId,
        frenteId: parseInt(form.value.frenteId)
      })

      // Guardar en localStorage
      localStorage.setItem('comprobantes', JSON.stringify(comprobantes.value))
      
      closeModal()
    }

    const confirmDelete = (comprobante) => {
      comprobanteToDelete.value = comprobante
      showDeleteModal.value = true
    }

    const deleteComprobante = () => {
      comprobantes.value = comprobantes.value.filter(c => c.id !== comprobanteToDelete.value.id)
      localStorage.setItem('comprobantes', JSON.stringify(comprobantes.value))
      showDeleteModal.value = false
      comprobanteToDelete.value = null
    }

    const sincronizar = () => {
      comprobantes.value = comprobantes.value.map(c => ({
        ...c,
        sincronizado: true
      }))
      localStorage.setItem('comprobantes', JSON.stringify(comprobantes.value))
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
    })

    return {
      comprobantes,
      frentes,
      showModal,
      showDeleteModal,
      comprobanteToDelete,
      errorMessage,
      filtroFrente,
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
