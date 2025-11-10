const CACHE_NAME = 'registros-forestal-v1'
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
]

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos')
        return cache.addAll(urlsToCache)
      })
      .catch(err => console.log('Error al cachear:', err))
  )
})

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpiando cache antiguo')
            return caches.delete(cache)
          }
        })
      )
    })
  )
})

// Estrategia: Network First, Cache Fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  
  // NO cachear peticiones a Airtable
  if (url.hostname.includes('airtable.com') || url.hostname.includes('api.airtable.com')) {
    // Dejar que la petición pase sin intervención del service worker
    return
  }

  // NO cachear peticiones POST, PUT, DELETE (solo GET)
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, actualizar el cache
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, intentar obtener del cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Si no está en cache, retornar página offline básica
          return caches.match('/index.html')
        })
      })
  )
})

// Sincronización en segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'sync-comprobantes') {
    event.waitUntil(syncComprobantes())
  }
})

async function syncComprobantes() {
  console.log('Sincronizando comprobantes...')
  // Aquí se implementaría la lógica de sincronización con un servidor
  // Por ahora, solo simularemos la sincronización
  return Promise.resolve()
}
