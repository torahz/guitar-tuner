// Service Worker para Afinador Pro
const CACHE_NAME = 'afinador-pro-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Arquivos estáticos para cache offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/themes.css',
  '/css/animations.css',
  '/js/utils.js',
  '/js/storage.js',
  '/js/tuner.js',
  '/js/ui.js',
  '/js/app.js',
  '/manifest.json',
  '/service-worker.js',
  '/README.md'
];

// Estratégia de cache: Cache First com fallback para rede
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erro ao instalar:', error);
      })
  );
});

// Ativação do service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Ativação concluída');
      return self.clients.claim();
    })
  );
});

// Estratégia de cache avançada
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Não cacheia requisições de navegação POST
  if (request.method !== 'GET') {
    return;
  }
  
  // Estratégia para arquivos estáticos: Cache First
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          
          // Clona a resposta para cache e retorna
          const responseClone = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          
          return networkResponse;
        });
      })
    );
  }
  
  // Estratégia para outras requisições: Network First com fallback
  event.respondWith(
    fetch(request).then((networkResponse) => {
      // Clona a resposta para cache
      const responseClone = networkResponse.clone();
      
      caches.open(DYNAMIC_CACHE).then((cache) => {
        // Limita o número de itens no cache dinâmico
        cache.put(request, responseClone);
        return trimCache(DYNAMIC_CACHE, 50);
      });
      
      return networkResponse;
    }).catch(() => {
      // Fallback para cache
      return caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Resposta offline padrão para páginas
        if (request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Verifica se é um asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Arquivos CSS, JS, imagens, fonts
  return pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
         pathname === '/' ||
         pathname.startsWith('/index.html');
}

// Limita o tamanho do cache
function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then((cache) => {
      return cache.keys().then((keys) => {
        if (keys.length > maxItems) {
          cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
        }
      });
    });
}

// Sincronização em segundo plano
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sincronização em segundo plano:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Pode ser usado para sincronizar dados quando a conexão for restaurada
      syncData()
    );
  }
});

// Mensagens do client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
    });
  }
});

// Funções auxiliares
async function syncData() {
  try {
    // Lógica de sincronização de dados offline
    console.log('[Service Worker] Sincronizando dados...');
  } catch (error) {
    console.error('[Service Worker] Erro na sincronização:', error);
  }
}

async function getCacheSize() {
  let totalSize = 0;
  
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// Push notifications (futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: 'Seu afinador está pronto para usar!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explorar',
        icon: '/assets/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/assets/icons/icon-72x72.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
  }
  
  event.waitUntil(
    self.registration.showNotification('Afinador Pro', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
