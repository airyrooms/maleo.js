var cacheName = 'weatherPWA-assets-4';
var dataCacheName = 'weatherPWA-data-4';
var filesToCache = [
  '/',
  '/favicon',
  '/images/icons/icon-32x32.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-256x256.png',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');

  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    }),
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }),
      );
    }),
  );

  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || cacheStrategy(e);
    }),
  );
});

// Caches all Maleo's bundled assets required for the page to run
function cacheStrategy(e) {
  const asset = e.request.url.match(/\/_assets\/(.+)/);
  if (asset) {
    return caches.open(cacheName).then(function(cache) {
      return fetch(e.request).then(function(response) {
        cache.put(e.request.url, response.clone());
        return response;
      });
    });
  }

  var url = '/api/forecast';
  if (e.request.url.indexOf(url) > -1) {
    // Cache then network
    return caches.open(dataCacheName).then(function(cache) {
      return fetch(e.request).then(function(response) {
        cache.put(e.request.url, response.clone());
        return response;
      });
    });
  }

  return fetch(e.request);
}
