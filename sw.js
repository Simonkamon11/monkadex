const CACHE_NAME = "monkadex-v1";
const POKEMON_CACHE = "pokemon-cache";

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

    self.skipWaiting();

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

        Promise.all([

            // Take control of open pages immediately
            clients.claim(),

            // Delete old caches
            caches.keys().then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (
                            key !== CACHE_NAME &&
                            key !== POKEMON_CACHE
                        ) {
                            console.log("Deleting old cache:", key);
                            return caches.delete(key);
                        }

                    })

                );

            })

        ])

    );

});


// Handle requests
self.addEventListener("fetch", event => {

    const request = event.request;


    // Pokémon API caching
    if (request.url.includes("pokeapi.co")) {

        event.respondWith(

            caches.open(POKEMON_CACHE)
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



    // Website files: network first
    event.respondWith(

        fetch(request)

            .then(response => {

                // Update cache with newest version
                const responseClone = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(request, responseClone);
                    });

                return response;

            })

            .catch(() => {

                // Offline fallback
                return caches.match(request)
                    .then(response => {

                        return response || caches.match(
                            "/monkadex/offline.html"
                        );

                    });

            })

    );

});