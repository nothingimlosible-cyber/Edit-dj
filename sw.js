const CACHE_NAME = 'dj-pro-v2';
const urlsToCache = ['./index.html', './app.js', './manifest.json', 'https://unpkg.com/tone@14.7.77/build/Tone.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
