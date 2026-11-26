// 구마 놀이터 서비스 워커
// - 앱으로 설치할 수 있게 해 준다 (Chrome 은 서비스 워커가 있어야 "앱 설치"를 보여 줌)
// - 항상 인터넷에서 최신 파일을 먼저 받고, 실패할 때만 저장해 둔 파일을 쓴다 (네트워크 우선)
//   그래서 업데이트를 올리면 다음에 앱을 열 때 바로 반영된다.
const CACHE = 'guma-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'species.js', 'manifest.json'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
