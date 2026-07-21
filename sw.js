const CACHE_NAME = 'monkadex-v4';
const POKEMON_CACHE = "PokeAPI_cache.1";

const CACHE_ASSETS = [
    "/monkadex/index.html",
    "/monkadex/offline.html",
    "/monkadex/style.css",
    "/monkadex/script.js",
    "/monkadex/javascript/game_of_life.js",
    "/monkadex/javascript/set_up.js",
    "/monkadex/javascript/misc.js",
    "/monkadex/javascript/fetch.js",
    "/monkadex/javascript/fetch_new_input.js",
    "/monkadex/javascript/state.js",
    "/monkadex/javascript/names_list.js",
    "/monkadex/javascript/fetch_clicked.js",
    "/monkadex/favicon.ico",
    "/monkadex/images/arrow_black.png",
    "/monkadex/images/arrow_white.png"
];
for(const item of ["pokedex", "dark", "light", "black", "ultraball", "premier", "gameboy"]) {
    CACHE_ASSETS.push(`/monkadex/images/pokeballs/pokeball_${item}.png`);
}
for(const item of ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"]) {
    CACHE_ASSETS.push(`/monkadex/images/pokemon_types/Type_${item}_HOME.webp`);
}

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(CACHE_ASSETS))
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
                            return cached || fetch(request)
                                                .then(response => {
                                                    return cache.put(request, response.clone())
                                                        .then(() => response);
                                                });
                        });
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