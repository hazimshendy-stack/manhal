/* Manhal Service Worker */
   const BUILD_ID = 'manhal-v7';
   const CACHE_NAME = 'manhal-' + BUILD_ID;
   const RUNTIME_CACHE = 'manhal-runtime-' + BUILD_ID;
   const PRECACHE_URLS = ['./', './index.html', './manifest.json', './favicon.svg', './icon-192.png', './icon-512.png'];

   self.addEventListener('install', (event) => {
     self.skipWaiting();
     event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {})));
   });

   self.addEventListener('activate', (event) => {
     event.waitUntil((async () => {
       const keys = await caches.keys();
       await Promise.all(
         keys
           .filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
           .map((k) => caches.delete(k))
       );
       await self.clients.claim();
     })());
   });

   self.addEventListener('fetch', (event) => {
     const { request } = event;
     const url = new URL(request.url);
     if (request.method !== 'GET') return;
     if (url.origin !== self.location.origin) return;
     if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) return;

     const isAppFile =
       request.destination === 'document' ||
       request.destination === 'script' ||
       request.destination === 'style' ||
       url.pathname.endsWith('.html') ||
       url.pathname.endsWith('.js') ||
       url.pathname.endsWith('.css') ||
       url.pathname.endsWith('.json');

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

     event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
   });

   self.addEventListener('message', (event) => {
     if (!event.data) return;
     if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
     if (event.data.type === 'CLEAR_CACHE') caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
   });
   