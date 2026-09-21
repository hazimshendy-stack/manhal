/* ═══════════════════════════════════════════════════════════════
   Service Worker — Auto-Update vmubuon2i-0bz1nj
   ═══════════════════════════════════════════════════════════════ */

const BUILD_ID = 'mubuon2i-0bz1nj';
const CACHE_NAME = 'sbapiaryy-' + BUILD_ID;
const RUNTIME_CACHE = 'sbapiaryy-runtime-' + BUILD_ID;

const PRECACHE_URLS = ['./', './index.html', './manifest.json', './favicon.svg'];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing build', BUILD_ID);
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating build', BUILD_ID);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map((k) => { console.log('[SW] Deleting:', k); return caches.delete(k); })
      );
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.postMessage({ type: 'SW_UPDATED', buildId: BUILD_ID }));
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) return;

  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)));
    return;
  }

  const isAppFile = request.destination === 'document' || request.destination === 'script' || request.destination === 'style'
    || url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.json');

  if (isAppFile) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'CLEAR_CACHE') caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  if (event.data.type === 'GET_VERSION') event.source?.postMessage({ type: 'VERSION', buildId: BUILD_ID });
});
