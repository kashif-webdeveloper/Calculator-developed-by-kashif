// UPDATED: Version v25 (Portfolio Protection Update)
const CACHE_NAME = 'kashif-pro-v25';

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
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => Promise.all(keyList.map((key) => {
    if (key !== CACHE_NAME) return caches.delete(key);
  }))));
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // 1. ADSENSE PROTECTION: Do not cache external links (Google Ads)
  if (!e.request.url.startsWith(self.location.origin)) return;

  // 2. PORTFOLIO PROTECTION: Do not cache or interfere with the Portfolio folder
  // This line is CRITICAL. It tells the calculator to ignore your portfolio.
  if (e.request.url.includes('/Kashifdevskills/')) return;

  // 3. Normal Calculator App Caching
  if (e.request.mode === 'navigate' || e.request.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request).then((m) => m || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
