/* American Style Nails Academy — educator PWA service worker */
const CACHE = 'asna-educator-v44';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const isHTML = e.request.mode === 'navigate' || u.pathname === '/' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html');
  if (isHTML) { // network-first: always load the freshest app when online, cached fallback offline
    e.respondWith(
      fetch(e.request).then(res => { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); return res; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith( // cache-first for static assets (icons, manifest)
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); return res;
    }).catch(() => caches.match('./index.html')))
  );
});
