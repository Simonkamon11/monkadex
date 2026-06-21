import { fetchPokemonData, fetchLocationData, fetchAreaData, fetchRegionData, fetchShinyData, fetchGameData, fetchMoveData } from './fetch.js'

export async function fetchNewInput(text) {
    document.getElementById('pokemonInput').value = text;
    await fetchPokemonData();
}

export async function fetchNewLocationInput(text) {
    document.getElementById('locationInput').value = text;
    await fetchLocationData();
}

export async function fetchNewAreaInput(text) {
    document.getElementById('areaInput').value = text;
    await fetchAreaData();
}

export async function fetchNewRegionInput(text) {
    document.getElementById('regionInput').value = text;
    fetchRegionData();
}

export async function fetchNewShinyInput(text) {
    document.getElementById('shinyInput').value = text;
    await fetchShinyData();
}

export async function fetchNewGameInput(text) {
    document.getElementById('gameInput').value = text;
    await fetchGameData();
}

export async function fetchNewMoveInput(text) {
    document.getElementById('moveInput').value = text;
    await fetchMoveData();
}