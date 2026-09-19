const CACHE_NAME = 'trading-journal-cache-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);
  // 같은 출처(이 앱 파일들)만 캐시 처리 - 폰트/차트 라이브러리 같은 외부 요청은 그대로 통과
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetchPromise = fetch(event.request).then(function(res) {
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, resClone); });
        return res;
      }).catch(function() { return cached; });
      return cached || fetchPromise;
    })
  );
});
