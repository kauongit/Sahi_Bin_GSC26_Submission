/* ================================================================
   Sahi Bin — Service Worker
   Cache-first for static assets, network-first for API/Firestore.
   Background sync for offline waste log submissions.
   ================================================================ */

const CACHE_NAME = 'sahi-bin-v4';
const RUNTIME_CACHE = 'sahi-bin-runtime-v4';

/* ---- App Shell: files to precache on install ---- */
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',

  /* CSS */
  '/css/design-system.css',
  '/css/components.css',
  '/css/navigation.css',
  '/css/auth.css',
  '/css/worker.css',
  '/css/citizen.css',

  /* JS — core modules */
  '/js/app.js',
  '/js/router.js',
  '/js/state.js',
  '/js/utils.js',
  '/js/icons.js',

  /* JS — firebase services */
  '/js/firebase/config.js',
  '/js/firebase/init.js',
  '/js/firebase/auth-service.js',
  '/js/firebase/db-service.js',
  '/js/firebase/storage-service.js',

  /* JS — offline utilities */
  '/js/offline/offline-queue.js',
  '/js/offline/sync-manager.js',
  '/js/offline/network-status.js',

  /* JS — verification */
  '/js/verification/gps-verifier.js',

  /* JS — classification */
  '/js/classification/engine.js',

  /* JS — consolidated screens */
  '/js/screens/auth.js',
  '/js/screens/worker-core.js',
  '/js/screens/worker-misc.js',
  '/js/screens/citizen-core.js',
  '/js/screens/citizen-rewards.js',
  '/js/screens/citizen-misc.js',

  /* JS — components */
  '/components/bottom-nav.js',
  '/components/brutalist-card.js',
  '/components/button.js',
  '/components/camera-viewfinder.js',
  '/components/chart.js',
  '/components/empty-state.js',
  '/components/error-state.js',
  '/components/form-input.js',
  '/components/header.js',
  '/components/loading-screen.js',
  '/components/modal.js',
  '/components/network-banner.js',
  '/components/progress-bar.js',
  '/components/score-circle.js',
  '/components/stat-tile.js',
  '/components/timeline.js',
  '/components/toast.js',

  /* Fonts (Google Fonts CSS — will cache the CSS, actual font files cache at runtime) */
  'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400;1,500;1,700;1,800;1,900&display=swap',
];

/* ---- Firestore / API URL patterns (network-first) ---- */
const API_PATTERNS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebase',
  'googleapis.com/v1',
  '/api/',
];

/* ---- Google Fonts static files (cache on first use) ---- */
const FONT_ORIGINS = [
  'https://fonts.gstatic.com',
];


/* ================================================================
   INSTALL — Precache the app shell
   ================================================================ */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing, precaching app shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Use addAll with individual error handling so one failure
        // doesn't block the entire install
        return Promise.allSettled(
          APP_SHELL.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to cache: ${url}`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] App shell cached successfully');
        return self.skipWaiting();
      })
  );
});


/* ================================================================
   ACTIVATE — Clean up old caches
   ================================================================ */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating, cleaning old caches...');
  const CURRENT_CACHES = [CACHE_NAME, RUNTIME_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !CURRENT_CACHES.includes(name))
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});


/* ================================================================
   FETCH — Routing strategy
   ================================================================ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, etc.)
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http schemes
  if (!url.protocol.startsWith('http')) return;

  /* ---- Strategy 1: Network-first for API / Firestore ---- */
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  /* ---- Strategy 2: Cache-first for Google Fonts static files ---- */
  if (isFontRequest(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  /* ---- Strategy 3: Cache-first for all other static assets ---- */
  event.respondWith(cacheFirst(request, CACHE_NAME));
});


/* ================================================================
   CACHING STRATEGIES
   ================================================================ */

/**
 * Cache-first: return cached response, fallback to network.
 * On network success, update the cache for next time.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);

    // Only cache valid responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return a fallback for navigation
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }

    return new Response('Offline — कृपया इंटरनेट कनेक्शन जाँचें', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
    });
  }
}

/**
 * Network-first: try network, fallback to cache.
 * Always update the cache on success.
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    return new Response(
      JSON.stringify({ error: 'offline', message: 'No network connection' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}


/* ================================================================
   URL MATCHERS
   ================================================================ */

function isApiRequest(url) {
  return API_PATTERNS.some((pattern) => url.href.includes(pattern));
}

function isFontRequest(url) {
  return FONT_ORIGINS.some((origin) => url.href.startsWith(origin));
}


/* ================================================================
   BACKGROUND SYNC
   Register sync tags for offline waste log & media uploads.
   ================================================================ */
self.addEventListener('sync', (event) => {
  console.log(`[SW] Background sync fired: ${event.tag}`);

  if (event.tag === 'sync-waste-logs') {
    event.waitUntil(syncWasteLogs());
  }

  if (event.tag === 'sync-media') {
    event.waitUntil(syncMedia());
  }
});

/**
 * Replay queued waste log entries from IndexedDB.
 */
async function syncWasteLogs() {
  try {
    console.log('[SW] Syncing waste logs...');
    // Open IndexedDB and replay pending waste log entries
    const db = await openSyncDB();
    const tx = db.transaction('pending-logs', 'readonly');
    const store = tx.objectStore('pending-logs');
    const entries = await getAllFromStore(store);

    for (const entry of entries) {
      try {
        // Post each entry to Firestore via the app's Firebase module
        // This notifies the main thread to handle the actual upload
        const clients = await self.clients.matchAll();
        for (const client of clients) {
          client.postMessage({
            type: 'SYNC_WASTE_LOG',
            payload: entry,
          });
        }
      } catch (err) {
        console.error('[SW] Failed to sync log entry:', err);
      }
    }

    console.log('[SW] Waste logs sync complete');
  } catch (error) {
    console.error('[SW] Waste logs sync failed:', error);
  }
}

/**
 * Replay queued media uploads from IndexedDB.
 */
async function syncMedia() {
  try {
    console.log('[SW] Syncing media uploads...');
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_MEDIA',
      });
    }
    console.log('[SW] Media sync signal sent');
  } catch (error) {
    console.error('[SW] Media sync failed:', error);
  }
}


/* ================================================================
   INDEXEDDB HELPERS (for background sync)
   ================================================================ */

function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sahi-bin-sync', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-logs')) {
        db.createObjectStore('pending-logs', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pending-media')) {
        db.createObjectStore('pending-media', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}


/* ================================================================
   MESSAGE HANDLER — skip waiting on demand
   ================================================================ */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({
      type: 'VERSION',
      payload: CACHE_NAME,
    });
  }
});


/* ================================================================
   PUSH NOTIFICATIONS (stub for future use)
   ================================================================ */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from Sahi Bin',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sahi Bin', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window or open new one
        for (const client of clients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
