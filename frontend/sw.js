const CACHE_NAME = 'ai-agent-v1';
const STATIC_ASSETS = [
  '/', '/index.html', '/css/styles.css', '/js/i18n.js', '/js/api-client.js',
  '/js/auth.js', '/js/chat.js', '/js/file-handler.js', '/js/voice.js', '/js/app.js', '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.url.includes('/api/')) return;

  event.respondWith(caches.match(request).then(cached => {
    if (cached) {
      fetch(request).then(response => { if (response.status === 200) caches.open(CACHE_NAME).then(c => c.put(request, response.clone())); }).catch(() => {});
      return cached;
    }
    return fetch(request).then(response => {
      if (response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
      }
      return response;
    });
  }).catch(() => request.mode === 'navigate' ? caches.match('/index.html') : undefined));
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(self.registration.showNotification(data.title || 'AI Agent', {
    body: data.body || 'New message',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png'
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});