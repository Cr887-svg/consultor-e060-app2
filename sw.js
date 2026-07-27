/* ============================================================
   SERVICE WORKER — Consultor E.060 (modo offline)
   Guarda TODOS los archivos de la app (incluyendo el texto
   completo de la norma) dentro del celular la primera vez que
   se abre. Después de eso, la app funciona sin internet.
   ============================================================ */

const CACHE_NAME = 'consultor-e060-v1';

const ARCHIVOS_A_GUARDAR = [
  './',
  './index.html',
  './manifest.json',
  './norma-data.json',
  './faq-data.js',
  './search-engine.js',
  './icon-512.png'
];

// Al instalar: descarga y guarda todos los archivos de una vez
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS_A_GUARDAR);
    })
  );
  self.skipWaiting();
});

// Al activar: elimina versiones viejas del caché si las hay
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) => {
      return Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      );
    })
  );
  self.clients.claim();
});

// Al pedir cualquier archivo: primero busca en el celular (caché),
// y solo si no lo encuentra, intenta buscarlo en internet.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((respuestaGuardada) => {
      return respuestaGuardada || fetch(event.request);
    })
  );
});
