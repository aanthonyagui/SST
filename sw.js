// CAMBIO 1: Subimos la versión para borrar el caché viejo y roto
const CACHE_NAME = 'sst-app-cache-v2'; 

const urlsToCache = [
    './',                // <--- Pone punto antes de la barra
    './index.html',      // <--- Pone punto
    './style.css',       // <--- Pone punto
    './script.js',       // <--- Pone punto
    './manifest.json',   // <--- Pone punto
    './icon-192x192.png',
    './icon-512x512.png',
    // Archivos nuevos (IMPORTANTE AGREGARLOS)
    './trabajadores.js',
    './pdfUtils.js',
    './pdfFicha.js',
    './pdfKardex.js',
    './pdfCarnet.js',
    './pdfATS.js',
    './excelGenerator.js',
    './iconos.js'
];

// ... (El resto del código déjalo igual)
// Instalar el Service Worker y cachear los archivos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker instalado. Cacheando archivos.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar el Service Worker y limpiar cachés antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Limpiando caché antiguo', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Estrategia de cache-first para servir recursos
self.addEventListener('fetch', (event) => {
    // Solo cacheamos peticiones GET (no las POST para enviar datos)
    if (event.request.method === 'GET') {
        event.respondWith(
            caches.match(event.request).then((response) => {
                // Si está en caché, lo servimos
                if (response) {
                    return response;
                }
                // Si no está en caché, intentamos obtenerlo de la red
                return fetch(event.request).then(
                    (response) => {
                        // Si recibimos una respuesta válida, la cacheamos
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                        return response;
                    }
                ).catch(() => {
                    // Si falla la red y no está en caché (ej. una nueva página),
                    // podrías servir una página offline genérica aquí.
                    // Para esta app, si es una URL principal, el index.html ya está cacheado.
                    console.log('Service Worker: Falló la red para', event.request.url);
                    // Aquí podrías añadir una página offline por defecto si no se encuentra nada
                    // return caches.match('/offline.html');
                });
            })
        );
    }
    // Para peticiones que no son GET (como las de enviar datos a la base de datos),
    // simplemente las dejamos pasar para que la red intente procesarlas.
    else {
        event.respondWith(fetch(event.request));
    }
});
