import { fetchPokemonData, fetchLocationData, fetchAreaData, fetchRegionData, fetchShinyData, fetchGameData, fetchMoveData } from './fetch.js'

export async function fetchNewInput(text) {
    document.getElementById('pokemonInput').value = text;
    fetchPokemonData();
}

export async function fetchNewLocationInput(text) {
    document.getElementById('locationInput').value = text;
    fetchLocationData();
}

export async function fetchNewAreaInput(text) {
    document.getElementById('areaInput').value = text;
    fetchAreaData();
}

export async function fetchNewRegionInput(text) {
    document.getElementById('regionInput').value = text;
    fetchRegionData();
}

export async function fetchNewGamesInput(text) {
    document.getElementById('gameInput').value = text;
    fetchGamesData();
}

export async function fetchNewLocateInput(text) {
    document.getElementById('pokemonInput').value = text;
    fetchLocateData();
}

export async function fetchNewShinyInput(text) {
    document.getElementById('shinyInput').value = text;
    fetchShinyData();
}

export async function fetchNewGameInput(text) {
    document.getElementById('gameInput').value = text;
    fetchGameData();
}

export async function fetchNewMoveInput(text) {
    document.getElementById('moveInput').value = text;
    fetchMoveData();
}