// Cloud City Food — Service Worker
// Provides offline support and faster repeat-visit loads.
// Version is bumped to invalidate old caches when content changes.

const CACHE_VERSION = 'cloudcity-v1.2026.01.27';
const RUNTIME_CACHE = 'cloudcity-runtime-v1';

// Core files to pre-cache (the app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/legal.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon.ico'
];

// External fonts and resources (cached with network-first strategy)
const RUNTIME_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/
];

// ============ INSTALL ============
// Pre-cache the app shell when the service worker is first installed.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pre-cache failed:', err))
  );
});

// ============ ACTIVATE ============
// Clean up old cache versions when a new SW takes over.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// ============ FETCH ============
// Strategy:
//   - HTML pages: network-first (always try fresh, fallback to cache offline)
//   - Static assets: cache-first (load fast, refresh in background)
//   - Fonts/external: network-first with cache fallback
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests (POST/PUT/etc — never cache)
  if (request.method !== 'GET') return;

  // Skip cross-origin requests we don't explicitly handle
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isExternalAllowed = RUNTIME_PATTERNS.some(p => p.test(request.url));
  if (!isSameOrigin && !isExternalAllowed) return;

  // HTML page: network-first
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Other assets (images, scripts, fonts): cache-first
  event.respondWith(cacheFirst(request));
});

// ============ STRATEGIES ============
async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    // Cache a copy for offline use
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    // Network failed — try cache
    const cached = await caches.match(request);
    if (cached) return cached;
    // Last resort: serve cached homepage
    const fallback = await caches.match('/index.html');
    if (fallback) return fallback;
    // Total failure
    return new Response('You are offline. Please check your connection.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Refresh in background
    fetch(request).then(fresh => {
      if (fresh && fresh.status === 200) {
        caches.open(RUNTIME_CACHE).then(c => c.put(request, fresh));
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const fresh = await fetch(request);
    if (fresh.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    return new Response('', { status: 504 });
  }
}
