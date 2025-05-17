// public/service-worker.js
/*
const CACHE_NAME   = 'liturgia-v1';
const MAX_AGE      = 5 * 24 * 60 * 60 * 1000; // 5 dias em ms
const STATIC_ASSETS = [
  '/', 
  '/index.html',
  '/manifest.json',
  '/offline.html',          // página de fallback offline
  '/css/variables.css',
  '/css/style.css',
  '/css/tema_claro.css',
  '/js/app.js',
  '/js/tema.js',
  '/content/index.json'
];

// 1) Instalando e pré-cache
self.addEventListener('install', evt => {
  evt.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache estático com proteção
    await Promise.all(
      STATIC_ASSETS.map(async file => {
        try {
          await cache.add(file);
        } catch (err) {
          console.warn('SW: Falhou ao cachear', file, err);
        }
      })
    );

    // Cache de conteúdo dinâmico
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
            console.warn('SW: Falhou ao cachear', file, err);
          }
        })
      );
    } catch (err) {
      console.error('SW pré-cache de conteúdo falhou:', err);
    }

    await self.skipWaiting();
  })());
});


// 2) Ativando e limpando caches antigos
self.addEventListener('activate', evt => {
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

// 3) Fetch: cache-first + revalidação automática se tiver mais de 5 dias
self.addEventListener('fetch', evt => {
  evt.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(evt.request);

    if (cachedResponse) {
      // verifica cabeçalho Date para ver se está “stale”
      const dateHeader = cachedResponse.headers.get('date');
      if (dateHeader) {
        const fetchedTime = new Date(dateHeader).getTime();
        if (Date.now() - fetchedTime > MAX_AGE) {
          // recurso no cache está velho: tenta buscar da rede e recachear
          try {
            const netRes = await fetch(evt.request);
            cache.put(evt.request, netRes.clone());
            return netRes;
          } catch (err) {
            // falhou na rede, devolve o cache antigo mesmo stale
            return cachedResponse;
          }
        }
      }
      // recurso no cache ainda é recente
      return cachedResponse;
    }

    // não está no cache: fallback para rede, e cacheia para próxima
    try {
      const netRes = await fetch(evt.request);
      cache.put(evt.request, netRes.clone());
      return netRes;
    } catch (err) {
      // se for navegação, mostra a página offline
      if (evt.request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
      throw err;
    }
  })());
});*/
