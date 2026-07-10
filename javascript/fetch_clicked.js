import { switchTheme } from './misc.js';
import { state } from './state.js';

export async function regionClicked(region) {
    const regionContainer = document.getElementById(`${region}-container`);
    switch(regionContainer.style.display) {
        case('none'): 
            regionContainer.style.display = 'block'; 
            break;
        default: 
            regionContainer.style.display = 'none'; 
            break;
    }

    let regionUrl;
    if(!regionContainer.hasChildNodes()) {
        for(const item of regionsData.results) {
            if(item.name === region) {
                regionUrl = item.url;
                break;
            }
        }

        const regionResponse = await fetch(regionUrl);
        if(!regionResponse.ok) {
            throw new Error(`Could not fetch region '${region}' data`);
        }
        globalThis.regionData = await regionResponse.json();

        let newH2, newDiv;
        for(const location of regionData.locations) {
            newH2 = document.createElement('h2');
            newH2.classList.add('text', 'clickable', 'locationText', 'locationsContent');
            newH2.textContent = `${location.name}:`;
            newH2.setAttribute('onclick', `locationClicked('${location.name}');`);
            regionContainer.appendChild(newH2);

            newDiv = document.createElement('div');
            newDiv.classList.add('locationsContent');
            newDiv.id = `${location.name}-container`;
            newDiv.style.display = 'none';
            regionContainer.appendChild(newDiv);
        }
    }
}

export async function locationClicked(location) {
    const locationContainer = document.getElementById(`${location}-container`);
    switch(locationContainer.style.display) {
        case('none'): 
            locationContainer.style.display = 'block'; 
            break;
        default: 
            locationContainer.style.display = 'none'; 
            break;
    }

    let locationUrl;
    if(!locationContainer.hasChildNodes()) {
        for(const item of regionData.locations) {
            if(item.name === location) {
                locationUrl = item.url;
                break;
            }
        }

        const locationResponse = await fetch(locationUrl);
        if(!locationResponse.ok) {
            throw new Error(`Could not fetch region '${location}' data`);
        }
        globalThis.locationData = await locationResponse.json();

        let newH2, newDiv;
        for(const area of locationData.areas) {
            newH2 = document.createElement('h2');
            newH2.classList.add('text', 'clickable', 'areaText', 'locationsContent');
            newH2.textContent = `${area.name}:`;
            newH2.setAttribute('onclick', `areaClicked('${area.name}');`);
            locationContainer.appendChild(newH2);

            newDiv = document.createElement('div');
            newDiv.classList.add('locationsContent');
            newDiv.id = `${area.name}-container`;
            newDiv.style.display = 'none';
            locationContainer.appendChild(newDiv);
        }
    }
}

export async function areaClicked(area) {
    const areaContainer = document.getElementById(`${area}-container`);
    switch(areaContainer.style.display) {
        case('none'): 
            areaContainer.style.display = 'block'; 
            break;
        default: 
            areaContainer.style.display = 'none'; 
            break;
    }

    let areaUrl;
    if(!areaContainer.hasChildNodes()) {
        for(const item of locationData.areas) {
            if(item.name === area) {
                areaUrl = item.url;
                break;
            }
        }

        const areaResponse = await fetch(areaUrl);
        if(!areaResponse.ok) {
            throw new Error(`Could not fetch region '${area}' data`);
        }
        const areaData = await areaResponse.json();

        let newH2, newDiv;
        newH2 = document.createElement('h2');
        newH2.classList.add('title-text', 'clickable', 'locationsContent');
        newH2.textContent = 'Encounters:';
        newH2.setAttribute('onclick', `switch(document.getElementById('${area}-encounters-container').style.display) {
        case('none'): document.getElementById('${area}-encounters-container').style.display = 'block'; break;
        default: document.getElementById('${area}-encounters-container').style.display = 'none'; break;
        }`);
        areaContainer.appendChild(newH2);

        newDiv = document.createElement('div');
        newDiv.id = `${area}-encounters-container`;
        newDiv.classList.add('locationsContent');
        areaContainer.appendChild(newDiv);
        const encounterContainer = document.getElementById(`${area}-encounters-container`);

        let encountersList = areaData.pokemon_encounters;
        if(params.get('game')) {
            encountersList = encountersList.filter(enc => {
                let hasVersion = false;
                for(const version of versionList) {
                    if(enc.version_details.map(det => det.version.name).includes(version)) {
                        hasVersion = true;
                    }
                }
                return hasVersion;
            })
        }

        let encounterNameTypeDiv, encounterNameHTML, encounterType1HTML, encounterType2HTML, encounterSpeciesHTML, encounterImg, encounterPokedexNrHTML;
        let encounterName, encounterUrl, encounterResponse, encounterData, encounterType1, encounterType2, encounterSpeciesResponse, encounterSpeciesData, encounterSpecies, encounterPokedexNr;
        let versionsList, gamesText, gamesContainer, gameText, gameContainer, maxEncounterChanceText, encounterChanceText, encounterMethodText;
        for(const encounter of encountersList) {
            versionsList = encounter.version_details;
            if(params.get('game')) {
                versionsList = versionsList.filter(ver => {
                    let isVersion = false;
                    for(const version of versionList) {
                        if(ver.version.name === version) {
                            isVersion = true;
                        }
                    }
                    return isVersion;
                })
            }
            encounterNameTypeDiv = document.createElement('div');
            encounterNameHTML = document.createElement('h2');
            encounterType1HTML = document.createElement('img');
            encounterType2HTML = document.createElement('img');
            encounterSpeciesHTML = document.createElement('h2');
            encounterImg = document.createElement('img');
            encounterPokedexNrHTML = document.createElement('h2');
            
            encounterName = encounter.pokemon.name;
            encounterUrl = encounter.pokemon.url;

            encounterResponse = await fetch(encounterUrl);
            if (!encounterResponse.ok) {
                throw new Error(`Could not fetch encounter '${encounterName}' data`);
            }
            encounterData = await encounterResponse.json();

            encounterNameTypeDiv.classList.add('locationsContent', 'name-type-container');
            encounterContainer.appendChild(encounterNameTypeDiv);

            encounterNameHTML.classList.add('locationsContent', 'text', 'pokemonName', 'clickable')
            encounterNameHTML.textContent = encounterName.charAt(0).toUpperCase() + encounterName.substring(1);
            encounterNameHTML.setAttribute('onclick', `window.location.href = '/monkadex/?pokemon=${encounterName}&theme=${params.get('theme')}'`);
            encounterNameTypeDiv.appendChild(encounterNameHTML);

            encounterType1HTML.classList.add('locationsContent');
            encounterType1 = encounterData.types[0].type.name.charAt(0).toUpperCase() + encounterData.types[0].type.name.substring(1);
            encounterType1HTML.src = `../images/pokemon_types/Type_${encounterType1}_HOME.webp`;
            encounterType1HTML.title = `${encounterType1} type`;
            encounterNameTypeDiv.appendChild(encounterType1HTML);

            if (encounterData.types.length === 2) {
                encounterType2HTML.classList.add('locationsContent');
                encounterType2 = encounterData.types[1].type.name.charAt(0).toUpperCase() + encounterData.types[1].type.name.substring(1);
                encounterType2HTML.src = `../images/pokemon_types/Type_${encounterType2}_HOME.webp`;
                encounterType2HTML.title = `${encounterType2HTML} type`;
                encounterNameTypeDiv.appendChild(encounterType2HTML);
            }

            encounterSpeciesResponse = await fetch(encounterData.species.url);
            if (!encounterSpeciesResponse.ok) {
                throw new Error(`Could not fetch encounter '${encounterName}' species data`);
            }
            encounterSpeciesData = await encounterSpeciesResponse.json();

            for (const item of encounterSpeciesData.genera) {
                if (item.language.name === 'en') {
                    encounterSpecies = item.genus;
                    break;
                }
            }
            encounterSpeciesHTML.classList.add('locationsContent', 'text', 'pokemonSpecies');
            encounterSpeciesHTML.textContent = 'The ' + encounterSpecies;
            encounterContainer.appendChild(encounterSpeciesHTML);

            encounterImg.classList.add('locationsContent', 'pokemonImages');
            encounterImg.src = encounterData.sprites.front_default;
            encounterImg.title = `${encounterName.charAt(0).toUpperCase() + encounterName.substring(1)} sprite`;
            encounterContainer.appendChild(encounterImg);
            switchTheme(state.usingTheme); // Updating the theme, so the image has the correct colour

            for (const item of encounterSpeciesData.pokedex_numbers) {
                if (item.pokedex.name === 'national') {
                    encounterPokedexNr = item.entry_number;
                    break;
                }
            }
            encounterPokedexNrHTML.classList.add('locationsContent', 'text', 'pokedexNr');
            encounterPokedexNrHTML.textContent = `Pokédex Nr. ${encounterPokedexNr}`;
            encounterContainer.appendChild(encounterPokedexNrHTML);

            gamesText = document.createElement('h2');
            gamesText.classList.add('text', 'clickable', 'gamesText', 'locationsContent')
            gamesText.setAttribute('onclick', `
            switch(document.getElementById('${area}-${encounterName}-games-container').style.display) {
                case('none'): document.getElementById('${area}-${encounterName}-games-container').style.display = 'block'; break;
                default: document.getElementById('${area}-${encounterName}-games-container').style.display = 'none'; break;
            }`);
            if(versionsList.length === 1) {
                gamesText.textContent = 'Game:';
            }
            else {
                gamesText.textContent = 'Games:';
            }
            encounterContainer.appendChild(gamesText);

            newDiv = document.createElement('div');
            newDiv.id = `${area}-${encounterName}-games-container`;
            newDiv.classList.add('locationsContent');
            encounterContainer.appendChild(newDiv);
            gamesContainer = document.getElementById(`${area}-${encounterName}-games-container`)

            for(const versionDetail of versionsList) {
                gameText = document.createElement('h2');
                gameText.classList.add('text', 'clickable', 'gameText', 'locationsContent');
                gameText.setAttribute('onclick', `
                switch(document.getElementById('${area}-${encounterName}-${versionDetail.version.name}-container').style.display) {
                    case('none'): document.getElementById('${area}-${encounterName}-${versionDetail.version.name}-container').style.display = 'block'; break;
                    default: document.getElementById('${area}-${encounterName}-${versionDetail.version.name}-container').style.display = 'none'; break;
                }`);
                gameText.textContent = `${versionDetail.version.name}:`;
                gamesContainer.appendChild(gameText);

                newDiv = document.createElement('div');
                newDiv.id = `${area}-${encounterName}-${versionDetail.version.name}-container`;
                newDiv.classList.add('locationsContent');
                gamesContainer.appendChild(newDiv);
                gameContainer = document.getElementById(`${area}-${encounterName}-${versionDetail.version.name}-container`);

                maxEncounterChanceText = document.createElement('h2');
                maxEncounterChanceText.classList.add('text', 'maxEncounterChanceText', 'locationsContent');
                maxEncounterChanceText.textContent = `Max encounter chance: ${versionDetail.max_chance}%`;
                gameContainer.appendChild(maxEncounterChanceText);

                for(const encounterDetail of versionDetail.encounter_details) {
                    encounterChanceText = document.createElement('h2');
                    encounterChanceText.classList.add('text', 'encounterChanceText', 'locationsContent');
                    encounterChanceText.textContent = `Encounter chance: ${encounterDetail.chance}%`;
                    gameContainer.appendChild(encounterChanceText);

                    encounterMethodText = document.createElement('h2');
                    encounterMethodText.classList.add('text', 'encounterMethodText', 'locationsContent');
                    encounterMethodText.textContent = `Encounter method: ${encounterDetail.method.name}`;
                    gameContainer.appendChild(encounterMethodText);
                }
            }
        }
    }
}