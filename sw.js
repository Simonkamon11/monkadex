const CACHE_NAME = 'monkadex-v1';
const POKEMON_CACHE = "PokéAPI_cache.1";

const OFFLINE_ASSETS = [
    "/monkadex/offline.html",
    "/monkadex/style.css",
    "/monkadex/script.js",
    "/monkadex/javascript/set_up.js",
    "/monkadex/javascript/misc.js",
    "/monkadex/javascript/fetch.js",
    "/monkadex/javascript/fetch_new_input.js",
    "/monkadex/javascript/state.js",
    "/monkadex/javascript/names_list.js",
    "/monkadex/javascript/fetch_new_input.js",
    "/monkadex/javascript/fetch_clicked.js",
    "/monkadex/favicon.ico",
    "/monkadex/images/arrow_black.png",
    "/monkadex/images/arrow_white.png",
    "/monkadex/images/pokeballs/pokeball_pokedex.png",
    "/monkadex/images/pokeballs/pokeball_dark.png",
    "/monkadex/images/pokeballs/pokeball_light.png",
    "/monkadex/images/pokeballs/pokeball_black.png",
    "/monkadex/images/pokeballs/pokeball_ultraball.png",
    "/monkadex/images/pokeballs/pokeball_premier.png",
    "/monkadex/images/pokeballs/pokeball_gameboy.png"
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(OFFLINE_ASSESTS))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if(cache !== CACHE_NAME && cache !== POKEMON_CACHE) {
                        console.log("Service Worker: Deleting cache:", cache);
                        return caches.delete(cache);
                    }
                })
            )
        })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;

    if(request.url.includes("pokeapi.co") || request.url.includes("PokeAPI")) {
        event.respondWith(
            caches.open(POKEMON_CACHE)
            .then(cache => {
                return cache.match(request)
                    .then(cached => {
                        if(cached) {
                            return cached;
                        }

                        return fetch(request)
                            .then(response => {
                                return cache.put(request, response.clone())
                                    .then(() => response);
                            });
                    })
            })
        );
    } else {
        event.respondWith(
            caches.match(request)
                .then(cached => {
                    return cached || fetch(request);
                })
                .catch(() => caches.match("/monkadex/offline.html"))
        );
    }
});