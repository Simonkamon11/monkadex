const CACHE_NAME = "monkadex-v1";

const STATIC_FILES = [
    "/monkadex/",
    "/monkadex/index.html",
    "/monkadex/style.css",
    "/monkadex/script.js",
    "/monkadex/manifest.json",
    "/monkadex/favicon.ico",
    "/monkadex/offline.html"
];


// Install service worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(STATIC_FILES);
            })
    );
});


// Activate service worker
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});


// Handle requests
self.addEventListener("fetch", event => {

    const request = event.request;


    // Cache Pokémon API requests
    if (request.url.includes("pokeapi.co")) {

        event.respondWith(
            caches.open("pokemon-cache")
                .then(cache => {

                    return cache.match(request)
                        .then(cachedResponse => {

                            if (cachedResponse) {
                                return cachedResponse;
                            }


                            return fetch(request)
                                .then(response => {

                                    cache.put(
                                        request,
                                        response.clone()
                                    );

                                    return response;

                                });

                        });

                })
        );

        return;
    }


    // Cache website files
    event.respondWith(
        caches.match(request)
            .then(response => {

                return response || fetch(request);

            })
    );

});