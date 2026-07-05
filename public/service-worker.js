// Service Worker بۆ پشتگیرییکردنا سیستەمێ ئۆفلاین (Offline Support) د پڕۆژا EcoFlow دا
const CACHE_NAME = 'ecoflow-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ١. دامەزراندنا Service Worker و پاشکەفتکرنا فایلێن سەرەکی (Install Event)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] پاشکەفتکرنا فایلێن سەرەکی...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ٢. کاراکرنا Service Worker و پاقژکرنا کاشێن کۆن (Activate Event)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] پاقژکرنا کاشا کۆن:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ٣. وەرگرتنا داخوازیا و بەرسڤدانا وان ب رێکا کاشێ یان ئینتەرنێتێ (Fetch Event)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ئەگەر فایل د کاشێ دا هەبیت، نیشا بدە؛ ئەگەر نە، ژ ئینتەرنێتێ بینە
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // ئەگەر داخوازیا دروست بوو، زێدەکەنە د کاشێ دا بۆ جارا بهێت
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // ئەگەر چو ئینتەرنێت نەبوو و فایل نە د کاشێ دا بوو
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
