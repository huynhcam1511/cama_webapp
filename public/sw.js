self.addEventListener('install', (event) => {
  console.log('CAMA PWA Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  // Simple fetch handler to satisfy PWA installation criteria
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline mode. Please check your internet connection.');
  }));
});
