const CACHE_NAME = 'smartpos-v1.0.0';
const RUNTIME = 'runtime';

// Static assets to cache immediately
const PRECACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.woff2'
];

// Network-first resources (API calls, dynamic content)
const NETWORK_FIRST_URLS = [
  '/api/'
];

// Cache-first resources (images, static assets)
const CACHE_FIRST_URLS = [
  '/static/',
  'https://images.unsplash.com/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/',
  'https://cdnjs.cloudflare.com/'
];

// Install event - precache essential assets
self.addEventListener('install', event => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Assets precached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  
  const currentCaches = [CACHE_NAME, RUNTIME];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            console.log('[SW] Deleting cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // Handle external resources with cache-first strategy
    if (CACHE_FIRST_URLS.some(pattern => request.url.includes(pattern))) {
      event.respondWith(cacheFirst(request));
    }
    return;
  }

  // Handle API calls with network-first strategy
  if (NETWORK_FIRST_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (CACHE_FIRST_URLS.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Handle navigation requests with network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: stale-while-revalidate for other requests
  event.respondWith(staleWhileRevalidate(request));
});

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
      });
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.status === 200) {
      const cache = caches.open(RUNTIME);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(error => {
    console.log('[SW] Network failed in stale-while-revalidate:', error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline sales
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncOfflineSales());
  }
});

// Sync offline sales when network is available
async function syncOfflineSales() {
  try {
    // This would typically sync with a backend server
    // For now, we'll just log that sync is happening
    console.log('[SW] Syncing offline sales data');
    
    // In a real implementation, you would:
    // 1. Get offline sales from IndexedDB
    // 2. Send them to your backend
    // 3. Mark them as synced
    // 4. Update local state
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}

// Push notifications (future feature)
self.addEventListener('push', event => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from SmartPOS+',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'smartpos-notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('SmartPOS+', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handling for communication with main app
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

// Periodic background sync (for compatible browsers)
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'inventory-sync') {
    event.waitUntil(syncInventoryData());
  }
});

async function syncInventoryData() {
  try {
    console.log('[SW] Syncing inventory data in background');
    // Implement periodic inventory sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error);
    throw error;
  }
}

// Cache management utilities
function cleanupCache() {
  return caches.keys().then(cacheNames => {
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('smartpos-') && name !== CACHE_NAME
    );
    
    return Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    );
  });
}

// Log service worker lifecycle
console.log('[SW] Service Worker loaded');
