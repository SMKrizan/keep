const APP_PREFIX = 'Keep-';
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION

// defines which files will be added to the cache
const FILES_TO_CACHE = [
    "/index.html",
    "/css/styles.css",
    // "/icons",
    "/js/idb.js",
    "/js/index.js"
];

// listens for fetch event and logs URL of requested resource and defines response
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    // will intercept HTTP reponse to send resources from service worker
    e.respondWith(
        // check whether resource already exists in cache
        caches.match(e.request).then(function (request) {
            // if (request) {
            //     console.log('responding with cache : ' + e.request.url)
            //     return request
            // } else {
            //     console.log('file is not cached, fetching : ' + e.request.url)
            //     return fetch(e.request)
            // }
            return request || fetch(e.request)
        })
    )
})

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

// clears out old cache data and tells service worker how to manaage caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        // this method will return a promise with an array of the caches.keys, held by 'keyList'
        caches.keys().then(function (keyList) {
            // any key with index value matching 'APP_PREFIX' will be inserted into 'cacheKeeplist'
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            // adds current CACHE_NAME to cacheKeeplist
            cacheKeeplist.push(CACHE_NAME);
            // this method will not return until all promises are returned or rejected
            return Promise.all(
                // maps through cacheKeylist and, if key not found in cacheKeeplist, will be deleted from cache 
                keyList.map(function (key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});