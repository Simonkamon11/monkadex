import { setupIndex, setupShinytools, setupLocations, setupMoves, setupOther, setup404 } from './javascript/set_up.js';
import { fetchPokemonData, fetchLocationData, fetchAreaData, fetchRegionData, fetchShinyData, fetchGameData, fetchMoveData, fetchGamesData, fetchLocateData } from './javascript/fetch.js';
import { encounterCounter } from './javascript/misc.js';
import { switchTheme } from './javascript/misc.js';

window.fetchPokemonData = fetchPokemonData;
window.fetchLocationData = fetchLocationData;
window.fetchAreaData = fetchAreaData;
window.fetchRegionData = fetchRegionData;
window.fetchShinyData = fetchShinyData;
window.fetchGameData = fetchGameData;
window.fetchMoveData = fetchMoveData;
window.fetchGamesData = fetchGamesData;
window.fetchLocateData = fetchLocateData;

if(window.location.pathname.endsWith("/monkadex/") || window.location.pathname.endsWith("/monkadex/index.html")) {
    setupIndex();
}
else if(window.location.pathname.endsWith("/shinytools/") || window.location.pathname.endsWith("/shinytools/index.html")) {
    setupShinytools();
}
else if(window.location.pathname.endsWith("/locations/") || window.location.pathname.endsWith("/locations/index.html")) {
    setupLocations();
}
else if(window.location.pathname.endsWith("/moves/") || window.location.pathname.endsWith("/moves/index.html")) {
    setupMoves();
}
else if(window.location.pathname.endsWith("/about/") || window.location.pathname.endsWith("/about/index.html") || window.location.pathname.endsWith("/sitemap.html") || window.location.pathname.endsWith("/security-policy.html") || window.location.pathname.endsWith("/privacy-policy.html") || window.location.pathname.endsWith("/offline.html") || window.location.pathname.endsWith("/thanks.html")) {
    setupOther();
}
else {
    setup404();
}

if("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/monkadex/sw.js")
            .then(() => {
                console.log("Service worker registered");
            })
            .catch(error => {
                console.log("Service worker failed:", error);
            });
    });
}