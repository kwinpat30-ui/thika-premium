// public/sw.js
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installed');
});
self.addEventListener('fetch', (e) => {
  // Empty fetch handler to pass Chrome's PWA installability criteria
});