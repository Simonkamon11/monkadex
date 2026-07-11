import { fetchNewInput, fetchNewLocationInput, fetchNewAreaInput, fetchNewRegionInput, fetchNewShinyInput, fetchNewGameInput, fetchNewMoveInput, fetchNewLocateInput, fetchNewGamesInput } from './fetch_new_input.js';
import { fetchRegionsData, fetchMovesData, fetchConstructionData } from './fetch.js';
import { switchTheme, encounterCounter } from './misc.js';

window.switchTheme = switchTheme;
window.encounterCounter = encounterCounter;
window.storedTheme = localStorage.getItem('theme');

export function setupIndex() {
    globalThis.params = new URLSearchParams(window.location.search);

    globalThis.pokemonParam = params.get('pokemon');
    globalThis.themeParam = params.get('theme');
    if (pokemonParam) {
        fetchNewInput(pokemonParam);
    }
    if(themeParam) {
        switchTheme(themeParam);
    }
    else if(storedTheme) {
        switchTheme(storedTheme);
    }
    else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            switchTheme('dark');
        }
        else {
            switchTheme('pokedex');
        }
    }
}

export function setupLocations() {
    globalThis.params = new URLSearchParams(window.location.search);

    globalThis.regionParam = params.get('region');
    globalThis.locationParam = params.get('location');
    globalThis.areaParam = params.get('area');
    globalThis.gameParam = params.get('game');
    globalThis.pokemonParam = params.get('pokemon');
    globalThis.themeParam = params.get('theme');
    if(pokemonParam) {
        if(gameParam) {
            params.delete('game');
        }
        if(areaParam) {
            params.delete('area');
        }
        if(locationParam) {
            params.delete('location');
        }
        if(regionParam) {
            params.delete('region');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        fetchNewLocateInput(pokemonParam);
    }
    else if(gameParam) {
        if(areaParam) {
            params.delete('area');
        }
        if(locationParam) {
            params.delete('location')
        }
        if(regionParam) {
            params.delete('region');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        fetchNewGamesInput(gameParam);
    }
    else if(areaParam) {
        if(locationParam) {
            params.delete('location')
        }
        if(regionParam) {
            params.delete('region');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        fetchNewAreaInput(areaParam);
    }
    else if(locationParam) {
        if(regionParam) {
            params.delete('region');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
        fetchNewLocationInput(locationParam);
    }
    else if(regionParam) {
        fetchNewRegionInput(regionParam);
    }
    else {
        fetchRegionsData();
    }
    if (themeParam) {
        switchTheme(themeParam);
    }
    else if(storedTheme) {
        switchTheme(storedTheme);
    }
    else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            switchTheme('dark');
        }
        else {
            switchTheme('pokedex');
        }
    }
}

export function setupShinytools() {
    window.storedPokemon = localStorage.getItem('pokemon');
    window.storedCount = localStorage.getItem('count');

    globalThis.params = new URLSearchParams(window.location.search);

    globalThis.pokemonParam = params.get('pokemon');
    globalThis.gameParam = params.get('game');
    globalThis.countParam = params.get('count');
    globalThis.themeParam = params.get('theme');
    if(pokemonParam) {
        fetchNewShinyInput(pokemonParam);
    }
    else if(storedPokemon) {
        fetchNewShinyInput(storedPokemon);
    }
    if(gameParam) {
        fetchNewGameInput(gameParam);
    }
    if(countParam) {
        encounterCounter('set', countParam);
    }
    else if(storedCount) {
        encounterCounter('set', storedCount);
    }
    else {
        params.set('count', '0');
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
    }
    if (themeParam) {
        switchTheme(themeParam);
    }
    else if(storedTheme) {
        switchTheme(storedTheme);
    }
    else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            switchTheme('dark');
        }
        else {
            switchTheme('pokedex');
        }
    }
}

export function setupMoves() {
    globalThis.params = new URLSearchParams(window.location.search);

    globalThis.moveParam = params.get('move');
    globalThis.themeParam = params.get('theme');
    if(moveParam) {
        fetchNewMoveInput(moveParam);
    }
    else {
        fetchMovesData();
    }
    if (themeParam) {
        switchTheme(themeParam);
    }
    else if(storedTheme) {
        switchTheme(storedTheme);
    }
    else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            switchTheme('dark');
        }
        else {
            switchTheme('pokedex');
        }
    }
    fetchConstructionData();
}

export function setupOther() {
    const params = new URLSearchParams(window.location.search);

    globalThis.themeParam = params.get('theme');

    let colour1, colour2;
    if(themeParam === 'dark' || storedTheme === 'dark') {
        colour1 = 'rgb(40, 40, 40)';
        colour2 = 'rgb(170, 170, 170)';
    }
    else if(themeParam === 'light' || storedTheme === 'light') {
        colour1 = 'rgb(255, 255, 255)';
        colour2 = 'rgb(0, 0, 0)';
    }
    else {
        if(themeParam) {
            const newUrl = window.location.pathname;
            window.history.pushState({}, "", newUrl);
        }
        if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
            colour1 = 'rgb(40, 40, 40)';
            colour2 = 'rgb(170, 170, 170)';
        }
        else {
            colour1 = 'rgb(255, 255, 255)';
            colour2 = 'rgb(0, 0, 0)';
        }
    }

    const body = document.getElementById('body');
    body.style['background-color'] = colour1;
    body.style['color'] = colour2;

    const border = document.getElementById('header-border');
    border.style['background-color'] = colour2;
}

export function setup404() {
    const params = new URLSearchParams(window.location.search);

    globalThis.themeParam = params.get('theme');

    let colour1, colour2;
    if(themeParam === 'dark' || storedTheme === 'dark') {
        colour1 = 'rgb(40, 40, 40)';
        colour2 = 'rgb(170, 170, 170)';
    }
    else if(themeParam === 'light' || storedTheme === 'light') {
        colour1 = 'rgb(255, 255, 255)';
        colour2 = 'rgb(0, 0, 0)';
    }
    else {
        if(themeParam) {
            const newUrl = window.location.pathname;
            window.history.pushState({}, "", newUrl);
        }
        if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
            colour1 = 'rgb(40, 40, 40)';
            colour2 = 'rgb(170, 170, 170)';
        }
        else {
            colour1 = 'rgb(255, 255, 255)';
            colour2 = 'rgb(0, 0, 0)';
        }
    }

    const body = document.getElementById('404-body');
    body.style['background-color'] = colour1;
    body.style['color'] = colour2;

    const border = document.getElementById('header-border');
    border.style['background-color'] = colour2;

    document.getElementById("404-pathname").textContent = window.location.pathname;
}