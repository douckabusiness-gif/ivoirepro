// Bypass and unregister Service Worker on localhost / development
if (typeof self !== 'undefined' && (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1')) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
    );
  });
}

const CACHE_NAME = 'boutique-pwa-v1.3.0';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/api/pwa/manifest',
  '/api/pwa/icon',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-maskable-512x512.svg'
];

// 1. INSTALL: Precache vital assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. ACTIVATE: Clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. FETCH: Smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or chrome extension schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // A. Navigation requests (HTML pages) -> Network first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match(OFFLINE_URL);
          return offlineFallback || new Response('Offline', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // B. Images and static media -> Cache first, fallback to network and cache dynamic
  if (
    request.destination === 'image' || 
    url.pathname.startsWith('/icons/') || 
    url.hostname.includes('images.unsplash.com') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          return caches.match('/icons/icon-192x192.svg').then(res => res || new Response('', { status: 404 }));
        });
      })
    );
    return;
  }

  // Branding assets are configurable from the admin. Always prefer the
  // latest icon so a newly saved PWA icon is visible without reinstalling.
  if (url.pathname === '/api/pwa/icon') {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-store' }))
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/api/pwa/icon', responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/api/pwa/icon').then((res) => res || caches.match('/icons/icon-192x192.svg')))
    );
    return;
  }

  // C. API requests -> Network first with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then(res => res || new Response(JSON.stringify({ error: 'Réseau indisponible' }), { 
            status: 503, 
            headers: { 'Content-Type': 'application/json' } 
          }));
        })
    );
    return;
  }

  // D. Other static assets (_next/static, fonts, css, js) -> Cache first / Network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        return new Response('', { status: 404 });
      });
    })
  );
});

// 4. Push notifications handler
self.addEventListener('push', (event) => {
  let data = { title: '⚡ Vente Flash Exclusive !', body: 'De nouvelles réductions jusqu\'à -50% sont disponibles sur la Boutique.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch(e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/api/pwa/icon',
    badge: '/api/pwa/icon',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
