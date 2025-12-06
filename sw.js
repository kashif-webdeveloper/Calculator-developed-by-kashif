// UPDATED: Version v6 to force all phones to download the new Install Button code
const CACHE_NAME = 'kashif-pro-v6';

// LIST OF ALL FILES TO SAVE OFFLINE
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './bmi-calculator.html',
  './contact.html',
  './exponent.html',
  './fraction.html',
  './log-calculator.html',
  './mortgage-calculator.html',
  './percentage.html',
  './privacy.html',
  './standard-deviation.html',
  './terms.html',
  './manifest.json',
  './icon.png'
];

// 1. Install Event: Downloads all files
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forces new service worker to take over immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate Event: Deletes OLD cache versions (v1...v5)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// 3. Fetch Event: Works Offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached file if found, otherwise go to network
      return response || fetch(e.request);
    })
  );
});
