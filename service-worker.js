const CACHE_NAME   = 'liturgia-v1';
const MAX_AGE      = 5 * 24 * 60 * 60 * 1000; // 5 dias em ms
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/css/variables.css',
  '/css/style.css',
  '/css/tema_claro.css',
  '/css/tema_escuro.css',
  '/js/app.js',
  '/js/tema.js',
  '/content/index.json',
  '/img/icons/compartilhar.png',
];

const isLocalhost = self.location.hostname === 'localhost'
                 || self.location.hostname === '127.0.0.1'
                 || self.location.hostname === '[::1]';

self.addEventListener('install', evt => {
  if (isLocalhost) {
    console.log('SW instalada em localhost → cache desabilitado');
    return;
  }
  evt.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // pré-cache estático
    await Promise.all(
      STATIC_ASSETS.map(async file => {
        try {
          await cache.add(file);
          console.log('SW: Cacheado', file);
        } catch (err) {
          console.warn('SW: falhou ao cachear', file, err);
        }
      })
    );

    // pré-cache dinâmico de conteúdo
    try {
      const res   = await fetch('/content/index.json');
      const index = await res.json();
      const contentFiles = index.flatMap(item => {
        const out = [`/content/${item.file}`];
        if (item.hebrew)     out.push(`/content/${item.hebrew}`);
        if (item.portuguese) out.push(`/content/${item.portuguese}`);
        return out;
      });
      await Promise.all(
        contentFiles.map(async file => {
          try {
            await cache.add(file);
            console.log('SW: Cacheado conteúdo', file);
          } catch (err) {
            console.warn('SW: falhou ao cachear conteúdo', file, err);
          }
        })
      );
    } catch (err) {
      console.error('SW pré-cache de conteúdo falhou:', err);
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', evt => {
  if (isLocalhost) return;
  evt.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', evt => {
  if (isLocalhost) {
    // modo dev: deixar tudo passar para a rede
    return;
  }
  evt.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(evt.request);

    if (cachedResponse) {
      // revalida se estiver “stale”
      const dateHeader = cachedResponse.headers.get('date');
      if (dateHeader) {
        const fetchedTime = new Date(dateHeader).getTime();
        if (Date.now() - fetchedTime > MAX_AGE) {
          try {
            const netRes = await fetch(evt.request);
            cache.put(evt.request, netRes.clone());
            return netRes;
          } catch {
            return cachedResponse;
          }
        }
      }
      return cachedResponse;
    }

    // não estava em cache: tenta rede e cacheia se relevante
    try {
      const netRes = await fetch(evt.request);
      // cacheia apenas se for arquivo estático ou de conteúdo
      if (evt.request.url.match(/\.(json|js|css|svg|png|jpg|jpeg|woff2?)$/)) {
        cache.put(evt.request, netRes.clone());
      }
      return netRes;
    } catch (err) {
      const fallbackCache = await cache.match(evt.request);
      if (fallbackCache) return fallbackCache;
      if (evt.request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
      throw err;
    }
  })());
});
