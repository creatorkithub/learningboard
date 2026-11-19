const CACHE_NAME = 'lb-core-v2';

self.addEventListener('install', event => {
    // Skip waiting to activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // Delete any stale caches and claim clients immediately
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Only intercept basic HTTP GET requests
    if (event.request.method !== 'GET') return;

    // For localhost development, let network requests pass through directly
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        event.respondWith(
            fetch(event.request).catch(err => {
                return caches.match(event.request);
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request).then(response => {
            // Ensure response is valid before caching
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // Clone the response stream and cache the latest version
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
            });

            return response;
        }).catch(() => {
            // Network failed (offline), fallback to cache
            return caches.match(event.request);
        })
    );
});
