self.addEventListener('install', event => {
  console.log('V1 installing…');

  // cache a cat SVG
  event.waitUntil(
    caches.open('static-v1').then(cache => cache.add('/cat.svg'))
  );
});

self.addEventListener('activate', event => {
  console.log('V1 now ready to handle fetches!');
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  console.log('fetch == ' , url);

  // serve the cat SVG from the cache if the request is
  // same-origin and the path is '/dog.svg'
  if (url.origin == location.origin && url.pathname == '/dog.svg') {
    event.respondWith(caches.match('/cat.svg'));
  }
});

self.addEventListener('activate', event => {
  // 如果activate足够快，clients.claim的调用在请求之前，就能保证初次请求页面也能拦截请求
  self.clients.claim();
});

self.addEventListener('install', event => {
  self.skipWaiting();
});