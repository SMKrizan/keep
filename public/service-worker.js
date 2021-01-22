// is the fact that I had a ',' instead of a ';' the reason for the lingering error?
const APP_PREFIX = "Keep-";
const VERSION = 'v1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "Keep-data-" + VERSION;

// defines files to be added to cache
const FILES_TO_CACHE = [
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
});

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


// clears out and tells service worker how to manaage caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        // this method will return a promise with an array of the caches.keys, held by 'keyList'
        caches.keys().then(keyList => {
            // filters cache containing app prefix and adds to new array
            let cacheKeepList = keyList.filter(key => {
                return key.indexOf(APP_PREFIX)
            });
            cacheKeepList.push(CACHE_NAME);
            // returns promise that resolves once all old versions of cache have been deleted
            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});
