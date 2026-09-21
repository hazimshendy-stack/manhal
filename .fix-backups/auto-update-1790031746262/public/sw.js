/* ═══════════════════════════════════════════════════════════════
   Service Worker — Auto-Update vmubumven-oldswy
   ═══════════════════════════════════════════════════════════════ */

const BUILD_ID = 'mubumven-oldswy';
const CACHE_NAME = 'sbapiaryy-' + BUILD_ID;
const RUNTIME_CACHE = 'sbapiaryy-runtime-' + BUILD_ID;
const VERSION_KEY = 'sbapiaryy-version';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
];

/* ─── Install: تخزين فوري + skip waiting ─── */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing build', BUILD_ID);
  self.skipWaiting(); // تفعيل فوري — مفيش انتظار
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
});

/* ─── Activate: امسح كل الكاشات القديمة فورًا ─── */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating build', BUILD_ID);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      );
      await self.clients.claim();
      // بلّغ كل التابات إن فيه نسخة جديدة
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATED', buildId: BUILD_ID });
      });
    })()
  );
});

/* ─── Fetch: Network-first للـ HTML/JS/CSS ─── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات اللي مش GET
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // مهم: Firebase + APIs دائمًا network
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.pathname.includes('/api/')
  ) {
    return;
  }

  // Version check endpoint — دائمًا network
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)));
    return;
  }

  // HTML/JS/CSS: network-first (عشان التحديثات)
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
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // الصور والأيقونات: cache-first
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

/* ─── Messages من الصفحة ─── */
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }

  if (event.data.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', buildId: BUILD_ID });
  }
});

/* ─── Push Notifications (للمستقبل) ─── */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'sbapiaryy', {
    body: data.body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
  });
});
