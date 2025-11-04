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
          <h1 class="text-xl font-bold text-gray-800">Gestión de Frentes</h1>
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
      <!-- Lista de Frentes -->
      <div v-if="frentes.length > 0" class="space-y-4">
        <div v-for="frente in frentes" :key="frente.id" class="card">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800">{{ frente.nombre }}</h3>
              <p class="text-gray-600 text-sm mt-1">{{ frente.descripcion }}</p>
              <span
                :class="frente.activo ? 'bg-malachite-50 text-malachite-400' : 'bg-gray-200 text-gray-600'"
                class="inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2"
              >
                {{ frente.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="flex space-x-2 ml-4">
              <button
                @click="editFrente(frente)"
                class="p-2 text-malachite-100 hover:bg-malachite-50 rounded-lg transition-colors"
                title="Editar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click="confirmDelete(frente)"
                class="p-2 text-red-ribbon-50 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        <p class="text-gray-600 mt-4">No hay frentes registrados</p>
        <button @click="showModal = true" class="btn-primary mt-4">Crear el primer frente</button>
      </div>
    </main>

    <!-- Modal Crear/Editar Frente -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          {{ editingFrente ? 'Editar Frente' : 'Nuevo Frente' }}
        </h2>
        
        <form @submit.prevent="saveFrente" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              class="input-field"
              placeholder="Ej: Frente Norte"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="input-field"
              placeholder="Descripción del frente"
            ></textarea>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.activo"
              type="checkbox"
              id="activo"
              class="w-4 h-4 text-malachite-100 border-gray-300 rounded focus:ring-malachite-100"
            />
            <label for="activo" class="ml-2 text-sm font-semibold text-gray-700">Activo</label>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" class="btn-primary flex-1">
              {{ editingFrente ? 'Actualizar' : 'Crear' }}
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
          ¿Estás seguro de que deseas eliminar el frente "{{ frenteToDelete?.nombre }}"?
        </p>
        <div class="flex space-x-3">
          <button @click="showDeleteModal = false" class="btn-secondary flex-1">
            Cancelar
          </button>
          <button @click="deleteFrente" class="btn-danger flex-1">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'FrentesView',
  setup() {
    const router = useRouter()
    const frentes = ref([])
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const editingFrente = ref(null)
    const frenteToDelete = ref(null)
    const form = ref({
      nombre: '',
      descripcion: '',
      activo: true
    })

    const goBack = () => {
      router.push('/dashboard')
    }

    const loadFrente = async () => {
      try {
        const response = await fetch('/data/frentes.json')
        frentes.value = await response.json()
      } catch (error) {
        console.error('Error cargando frentes:', error)
      }
    }

    const closeModal = () => {
      showModal.value = false
      editingFrente.value = null
      form.value = {
        nombre: '',
        descripcion: '',
        activo: true
      }
    }

    const editFrente = (frente) => {
      editingFrente.value = frente
      form.value = { ...frente }
      showModal.value = true
    }

    const saveFrente = async () => {
      try {
        if (editingFrente.value) {
          // Actualizar frente existente
          const index = frentes.value.findIndex(f => f.id === editingFrente.value.id)
          if (index !== -1) {
            frentes.value[index] = { ...form.value, id: editingFrente.value.id }
          }
        } else {
          // Crear nuevo frente
          const newId = frentes.value.length > 0 
            ? Math.max(...frentes.value.map(f => f.id)) + 1 
            : 1
          frentes.value.push({ ...form.value, id: newId })
        }

        // Guardar en localStorage (simulando persistencia)
        localStorage.setItem('frentes', JSON.stringify(frentes.value))
        
        closeModal()
      } catch (error) {
        console.error('Error guardando frente:', error)
      }
    }

    const confirmDelete = (frente) => {
      frenteToDelete.value = frente
      showDeleteModal.value = true
    }

    const deleteFrente = () => {
      frentes.value = frentes.value.filter(f => f.id !== frenteToDelete.value.id)
      localStorage.setItem('frentes', JSON.stringify(frentes.value))
      showDeleteModal.value = false
      frenteToDelete.value = null
    }

    onMounted(async () => {
      // Intentar cargar desde localStorage primero
      const stored = localStorage.getItem('frentes')
      if (stored) {
        frentes.value = JSON.parse(stored)
      } else {
        await loadFrente()
        localStorage.setItem('frentes', JSON.stringify(frentes.value))
      }
    })

    return {
      frentes,
      showModal,
      showDeleteModal,
      editingFrente,
      frenteToDelete,
      form,
      goBack,
      closeModal,
      editFrente,
      saveFrente,
      confirmDelete,
      deleteFrente
    }
  }
}
</script>
