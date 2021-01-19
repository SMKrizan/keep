const APP_PREFIX = 'Keep-';
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION
// defines which files will be added to the cache
const FILES_TO_CACHE = [
    "./public/index.html",
    "./public/css/styles.css",
    "./public/icons",
    "./public/js/idb.js",
    "./public/js/index.js"
];

// adds files to precache; 'self' instantiates a listener on the service worker, as service workers run even before a 'window' object has been created.
self.addEventListener('install', function (e) {
    // tells browser to wait until work is complete before terminating service worker
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
}) 