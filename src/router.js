import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Frentes from './views/Frentes.vue'
import Comprobantes from './views/Comprobantes.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/frentes',
    name: 'Frentes',
    component: Frentes,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/comprobantes',
    name: 'Comprobantes',
    component: Comprobantes,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  const userRole = currentUser.rol || 'usuario'
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si la ruta requiere autenticación y no está autenticado, redirigir al login
    next('/login')
  } else if (to.meta.requiresAdmin && userRole !== 'admin') {
    // Si la ruta requiere rol admin y el usuario no es admin, redirigir al dashboard
    next('/dashboard')
  } else if (to.path === '/login' && isAuthenticated) {
    // Si está autenticado e intenta ir al login, redirigir al dashboard
    next('/dashboard')
  } else {
    next()
  }
})

export default router
