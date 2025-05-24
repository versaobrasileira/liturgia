const CACHE_NAME   = 'liturgia-v1';
const MAX_AGE      = 5 * 24 * 60 * 60 * 1000; // 5 dias em ms
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/config/fontConfig.json',
  '/css/variables.css',
  '/css/base.css',
  '/css/tema_claro.css',
  '/css/tema_invert.css',
  '/css/components-bundle.css',
  '/js/app.js',
  '/js/loader.js',
  '/js/components/ContentDisplayPanel/ContentDisplayPanel.js',
  '/js/components/ContentDisplayPanel/ContentDisplayPanel.css',
  '/js/components/ConteudoPanel/ConteudoPanel.js',
  '/js/components/ConteudoPanel/ConteudoPanel.css',
  '/js/components/Controls/Controls.js',
  '/js/components/Controls/Controls.css',
  '/js/components/Fullscreen/Fullscreen.js',
  '/js/components/Fullscreen/Fullscreen.css',
  '/js/components/FullscreenToggle/FullscreenToggle.js',
  '/js/components/FullscreenToggle/FullscreenToggle.css',
  '/js/components/LangDropdown/LangDropdown.js',
  '/js/components/LangDropdown/LangDropdown.css',
  '/js/components/LyricsPanel/LyricsPanel.js',
  '/js/components/LyricsPanel/LyricsPanel.css',
  '/js/components/ResultsPanel/ResultsPanel.js',
  '/js/components/ResultsPanel/ResultsPanel.css',
  '/js/components/SearchContainer/SearchContainer.js',
  '/js/components/SearchContainer/SearchContainer.css',  
  '/js/components/SearchForm/SearchForm.js',
  '/js/components/SearchForm/SearchForm.css',
  '/js/components/ShareButton/ShareButton.js',
  '/js/components/ShareButton/ShareButton.css',
  '/js/components/ThemeToggle/ThemeToggle.js',
  '/js/components/ThemeToggle/ThemeToggle.css',
  '/js/components/TitleBar/TitleBar.js',
  '/js/components/TitleBar/TitleBar.css',
  '/js/components/ZoomInButton/ZoomInButton.js',
  '/js/components/ZoomInButton/ZoomInButton.css',
  '/js/components/ZoomOutButton/ZoomOutButton.js',
  '/js/components/ZoomOutButton/ZoomOutButton.css',
  '/js/components/SearchContainer/search/engine.js',
  '/js/components/SearchContainer/search/scorer.js',
  '/js/components/SearchContainer/search/search-utils.js',
  '/js/components/SearchContainer/search/strategies.js',
  '/js/components/SearchContainer/search/utils.js',
  '/content/all.json',    // <<=== BASTA ISSO!
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
