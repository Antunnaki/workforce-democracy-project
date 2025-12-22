/**
 * SERVICE WORKER - Progressive Enhancement
 * Offline capabilities and performance optimization
 * Updated: 2025-01-22 V42Y - EQUAL TABS & CLEANUP
 * 
 * COMPREHENSIVE FIX: Equal tab sizing, removed duplicates, fixed conflicts
 * All updates should now apply correctly
 * Service worker updated to force complete cache clear
 */

const CACHE_VERSION = 'wdp-v1.1.9-emergency-reset-' + Date.now();
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/js/app-shell.mjs',
    '/js/modules/home-mount.mjs',
    '/env-config.mjs'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches IMMEDIATELY
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        console.log('Service Worker: Purging cache', cache);
                        return caches.delete(cache);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - ALWAYS FETCH FRESH (bypass all caching)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request, {
            cache: 'reload'  // Force fresh fetch, bypass HTTP cache
        })
            .then((response) => {
                // Clone the response and add no-cache headers
                const newHeaders = new Headers(response.headers);
                newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                newHeaders.set('Pragma', 'no-cache');
                newHeaders.set('Expires', '0');
                
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders
                });
            })
            .catch(() => {
                // Network failed - show error
                return new Response('Network error - please check your connection', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});
