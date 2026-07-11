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

const page = document.body.dataset.page;

if(page === "index") {
    setupIndex();
}
else if(page === "shinytools") {
    setupShinytools();
}
else if(page === "locations") {
    setupLocations();
}
else if(page === "moves") {
    setupMoves();
}
else if(page === "about" || page === "sitemap" || page === "security" || page === "privacy" || page === "offline" || page === "thanks") {
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