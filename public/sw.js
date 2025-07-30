// Advanced Service Worker for Cortex PWA
// Provides offline functionality, background sync, and push notifications

const CACHE_NAME = 'cortex-v1.0.0';
const STATIC_CACHE_NAME = 'cortex-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'cortex-dynamic-v1.0.0';
const API_CACHE_NAME = 'cortex-api-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/main.css',
  '/src/index.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// API endpoints to cache
const API_PATTERNS = [
  /^https:\/\/api\.cortex\.app\//,
  /^\/api\//
];

// Background sync patterns
const SYNC_PATTERNS = {
  'notes-sync': /\/api\/notes/,
  'tasks-sync': /\/api\/tasks/,
  'analytics-sync': /\/api\/analytics/
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch event - handle all network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return handleNonGetRequest(event);
  }
  
  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'notes-sync') {
    event.waitUntil(syncNotes());
  } else if (event.tag === 'tasks-sync') {
    event.waitUntil(syncTasks());
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have new updates in Cortex',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open Cortex',
        icon: '/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icon-72x72.png'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Cortex', options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CACHE_API_DATA':
        cacheApiData(event.data.url, event.data.data);
        break;
    }
  }
});

// Helper functions

function isStaticAsset(url) {
  return url.pathname.includes('.css') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.tsx') ||
         url.pathname.includes('.ico') ||
         url.pathname.includes('.png') ||
         url.pathname.includes('.svg') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

function isApiRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url.href));
}

async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Static asset fetch failed:', error);
    return new Response('Asset unavailable offline', { status: 503 });
  }
}

async function handleApiRequest(request) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    
    // Try network first for API requests
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (networkError) {
      console.log('Service Worker: Network failed, trying cache');
      
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline response
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'This data is not available offline' 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Service Worker: API request failed:', error);
    return new Response('Service unavailable', { status: 503 });
  }
}

async function handleDynamicRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    // Stale while revalidate strategy
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // Return cached response if network fails
      return cachedResponse;
    });
    
    // Return cached response immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Otherwise wait for network
    return await fetchPromise;
  } catch (error) {
    console.error('Service Worker: Dynamic request failed:', error);
    return new Response('Page unavailable offline', { status: 503 });
  }
}

function handleNonGetRequest(event) {
  const { request } = event;
  
  // Handle POST/PUT/DELETE requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Queue for background sync
        return new Promise((resolve) => {
          // Store the request for later sync
          storeFailedRequest(request);
          
          resolve(new Response(
            JSON.stringify({ 
              queued: true, 
              message: 'Request queued for sync when online' 
            }),
            {
              status: 202,
              headers: { 'Content-Type': 'application/json' }
            }
          ));
        });
      })
    );
  }
}

async function storeFailedRequest(request) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['failed-requests'], 'readwrite');
    const store = transaction.objectStore('failed-requests');
    
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    store.add(requestData);
  } catch (error) {
    console.error('Failed to store request:', error);
  }
}

async function syncNotes() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['failed-requests'], 'readonly');
    const store = transaction.objectStore('failed-requests');
    const requests = await store.getAll();
    
    const noteRequests = requests.filter(req => 
      req.url.includes('/api/notes')
    );
    
    for (const req of noteRequests) {
      try {
        await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body
        });
        
        // Remove successful request
        const deleteTransaction = db.transaction(['failed-requests'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('failed-requests');
        deleteStore.delete(req.id);
      } catch (error) {
        console.error('Failed to sync note request:', error);
      }
    }
  } catch (error) {
    console.error('Notes sync failed:', error);
  }
}

async function syncTasks() {
  // Similar implementation to syncNotes but for tasks
  console.log('Syncing tasks...');
}

async function syncAnalytics() {
  // Sync analytics data
  console.log('Syncing analytics...');
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cortex-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('failed-requests')) {
        const store = db.createObjectStore('failed-requests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('url', 'url');
      }
    };
  });
}

async function cacheApiData(url, data) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(url, response);
  } catch (error) {
    console.error('Failed to cache API data:', error);
  }
}

// Periodic cleanup of old cache entries
setInterval(async () => {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > maxAge) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily