// --- Service Worker para Agromarket ---
// Estrategias:
//  - Navegaciones (HTML): network-first con fallback a caché /index.html
//  - Assets estáticos (css/js/img/font): cache-first con actualización en segundo plano
//  - Otros (APIs): network-first con fallback a caché si existiera
// Incluye manejo de errores para evitar "promise was rejected"

const VERSION = 'v1.1.0';
const CACHE_NAME = `agromarket-${VERSION}`;

const ASSETS = [
  '/',                    // raíz
  '/index.html',
  '/login.html',
  '/registro.html',
  '/panel-empresa.html',
  '/panel-productor.html',
  '/estilos.css',
  '/app.js',
  '/panel-empresa.js',
  '/panel-productor.js',
  '/api.js',
  '/manifest.json',
];

// ---------- Install ----------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---------- Activate ----------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(n => (n !== CACHE_NAME ? caches.delete(n) : undefined))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------- Helpers ----------
async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) {
    // Actualiza en background
    fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
    }).catch(() => {});
    return cached;
  }
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    // último recurso: lo que haya en caché (probablemente undefined)
    return cached;
  }
}

async function networkFirst(req, { fallbackToCache = true } = {}) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    if (fallbackToCache) {
      const cached = await cache.match(req);
      if (cached) return cached;
    }
    // Devuelve una Response genérica para no rechazar la promesa
    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

async function navigationHandler(req) {
  // Network-first, con fallback a caché y luego a /index.html
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    // Fallback universal para SPA/MPA
    const idx = await cache.match('/index.html');
    return idx || new Response('Offline', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
}

// ---------- Fetch ----------
self.addEventListener('fetch', event => {
  const req = event.request;

  // Navegaciones (documentos HTML)
  if (req.mode === 'navigate') {
    event.respondWith(navigationHandler(req));
    return;
  }

  // Destinos estáticos
  const dest = req.destination; // 'style' | 'script' | 'image' | 'font' | 'document' | ...
  if (['style', 'script', 'image', 'font'].includes(dest)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Otros (por ejemplo, fetch a APIs)
  event.respondWith(networkFirst(req, { fallbackToCache: true }));
});
