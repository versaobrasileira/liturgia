// public/service-worker.js

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

// detecta ambiente local para pular cache em dev
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
    // pré-cache estéreo (arquivos estáticos)
    await Promise.all(
      STATIC_ASSETS.map(async file => {
        try {
          await cache.add(file);
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
          } catch (err) {
            console.warn('SW: falhou ao cachear', file, err);
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

    // não estava em cache: tenta rede, e cacheia
    try {
      const netRes = await fetch(evt.request);
      cache.put(evt.request, netRes.clone());
      return netRes;
    } catch (err) {
      if (evt.request.mode === 'navigate') {
        // fallback para offline.html em navegação
        return caches.match('/offline.html');
      }
      throw err;
    }
  })());
});
