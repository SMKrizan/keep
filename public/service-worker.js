const VERSION = 'v1';
const CACHE_NAME = 'Keep-'+VERSION;
const DATA_CACHE_NAME = "Keep-data-"+VERSION;

// defines files to be added to cache
const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
    "./js/idb.js",
    "./js/index.js"
];

// listens for fetch event and logs URL of requested resource and defines response
self.addEventListener('fetch', function (e) {
    // cache all get requests to /api routes
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request)
                    .then(response => {
                        // stores cloned response within cache
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        // if network request fails, get from cache
                        return cache.match(e.request);
                    });
            })
                .catch(err => console.log(err))
        );
        return;
    }
    // will intercept HTTP reponse to send any static resources from service worker
    e.respondWith(
        fetch(e.request).catch(function () {
            return caches.match(e.request).then(function (response) {
                if (response) {
                    return response;
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    // return cached homepage for all requests to html pages
                    return caches.match('/');
                }
            });
        })
    );
})

// adds files to precache; 'self' instantiates a listener on the service worker, as service workers run even before a 'window' object has been created.
self.addEventListener('install', function (e) {
    // tells browser to wait until installation is complete
    e.waitUntil(
        // finds specific cache by name
        caches.open(CACHE_NAME).then(cache => {
            console.log('installing cache : ' + CACHE_NAME)
            // add all files to cache
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    // can be called at any point during service worker's execution; will only have an effect if there's a newly installed service worker (that would otherwise remain in waiting state/hold up activation)
    self.skipWaiting();
});

// clears out and tells service worker how to manaage caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        // this method will return a promise with an array of the caches.keys, held by 'keyList'
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            )
        })
    );
    // allows active service worker to set itself as controller for all clients within its scope resulting in service worker controlling pages that loaded regularly over the network.
    self.clients.claim();
});