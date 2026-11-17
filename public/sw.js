const CACHE_NAME = 'birdie-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/maskable-icon.png',
];

// インストール：静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// アクティベーション：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// フェッチ：ネットワーク優先、失敗時はキャッシュフォールバック
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API リクエストはネットワーク優先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // 静的リソースはキャッシュ優先
  event.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      })
    )
  );
});

// プッシュ通知購読（プレースホルダ）
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : '新しい通知があります';
  event.waitUntil(
    self.registration.showNotification('Birdie', {
      body: data,
      icon: '/pwa/icon-192.png',
      badge: '/pwa/icon-192.png',
    })
  );
});
