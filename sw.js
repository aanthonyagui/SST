const CACHE_NAME = 'sst-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon-192x192.png', // Asegúrate de tener estos iconos
    '/icon-512x512.png', // Asegúrate de tener estos iconos
    // Aquí puedes añadir más recursos estáticos si tienes
];

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
