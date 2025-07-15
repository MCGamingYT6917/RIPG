const CACHE_NAME = 'subdomain-gen-cache-v1';
const FILES_TO_CACHE = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  // Optional: include your icons if you use them
  // 'icon-192.png',
  // 'icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching offline assets');
      return cache.addAll(FILES_TO_CACHE);
    }).catch(err => {
      console.warn('[ServiceWorker] Failed to cache:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    }).catch(() => {
      return new Response('Offline and asset not cached.', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    })
  );
});
