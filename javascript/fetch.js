import { get3ClosestNames } from './names_list.js';
import { fetchNewInput, fetchNewLocationInput, fetchNewAreaInput, fetchNewRegionInput, fetchNewShinyInput, fetchNewGameInput, fetchNewMoveInput } from './fetch_new_input.js';
import { regionClicked, locationClicked, areaClicked } from './location_clicked.js';
import { getPokemonList } from './names_list.js';
import { switchTheme } from './misc.js';
import { state } from './state.js';

window.fetchNewInput = fetchNewInput;
window.fetchNewLocationInput = fetchNewLocationInput;
window.fetchNewAreaInput = fetchNewAreaInput;
window.fetchNewRegionInput = fetchNewRegionInput;
window.fetchNewShinyInput = fetchNewShinyInput;
window.fetchNewGameInput = fetchNewGameInput;
window.fetchNewMoveInput = fetchNewMoveInput;
window.regionClicked = regionClicked;
window.locationClicked = locationClicked;
window.areaClicked = areaClicked;

export async function fetchPokemonData() {
    const didYou = document.getElementById('didYou');
    if (didYou !== null) {didYou.remove();}
    document.querySelectorAll('.meanText').forEach(el => el.remove());

    document.getElementById('fetchText').textContent = 'Fetching data...';
    try {
        const pokemonName = document.getElementById('pokemonInput').value.toLowerCase().replace(" ", "-");

        params.set('pokemon', pokemonName);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if (response.status === 404) {
            throw new Error('Pokémon not found');
        }
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }

        const data = await response.json();

        const speciesResponse = await fetch(data.species.url);
        if (!speciesResponse.ok) {
            throw new Error('Could not fetch species data');
        }
        document.getElementById('fetchText').textContent = 'Data fetched successfully';

        const speciesData = await speciesResponse.json();

        const speciesName = speciesData.name;

        let baseStatTotal = 0;
        for (const stat of data.stats) {
            baseStatTotal += stat.base_stat;
        }

        const pokemonSprite = data.sprites.front_default;
        const shinySprite = data.sprites.front_shiny;

        const name = data.name.charAt(0).toUpperCase() + data.name.substring(1)

        document.getElementById('pokemonName').textContent = name;

        const type1Img = document.getElementById('type1');
        const type1 = data.types[0].type.name.charAt(0).toUpperCase() + data.types[0].type.name.substring(1);
        type1Img.src = `images/pokemon_types/Type_${type1}_HOME.webp`;
        type1Img.style.display = 'block';
        type1Img.title = `${type1} type`;

        const type2Img = document.getElementById('type2');
        if (data.types.length === 2) {
            const type2 = data.types[1].type.name.charAt(0).toUpperCase() + data.types[1].type.name.substring(1);
            type2Img.src = `images/pokemon_types/Type_${type2}_HOME.webp`;
            type2Img.style.display = 'block';
            type2Img.title = `${type2} type`;
        }
        else {
            type2Img.src = '';
            type2Img.style.display = 'none';
        }

        let pokemonSpecies;
        for (const item of speciesData.genera) {
            if (item.language.name === 'en') {
                pokemonSpecies = item.genus;
                break;
            }
        }
        document.getElementById('pokemonSpecies').textContent = 'The ' + pokemonSpecies;

        const imgPokemon = document.getElementById('pokemonSprite');
        imgPokemon.src = pokemonSprite;
        imgPokemon.style.display = 'block';
        imgPokemon.title = `${name} sprite`;

        const imgShiny = document.getElementById('shinySprite');
        imgShiny.src = shinySprite;
        imgShiny.style.display = 'block';
        imgShiny.title = `${name} shiny sprite`;
        document.getElementById('shiny-sparkles').style.display = 'block';

        document.getElementById('shinyImage-container').onclick = () => window.location.href = `https://simonkamon11.github.io/monkadex/shinytools/?pokemon=${pokemonName}&theme=${params.get('theme')}`;

        let pokedexNr;
        for (const item of speciesData.pokedex_numbers) {
            if (item.pokedex.name === 'national') {
                pokedexNr = item.entry_number;
                break;
            }
        }

        document.getElementById('pokedexNr').textContent = `Pokédex Nr. ${pokedexNr}`;

        document.getElementById('statsText').style.display = 'block';

        document.getElementById('hpStat').textContent = `HP:         ${data.stats[0].base_stat}`;
        document.getElementById('atkStat').textContent = `Attack:     ${data.stats[1].base_stat}`;
        document.getElementById('defStat').textContent = `defence:    ${data.stats[2].base_stat}`;
        document.getElementById('spAtkStat').textContent = `Sp. Atk:    ${data.stats[3].base_stat}`;
        document.getElementById('spDefStat').textContent = `Sp. Def:    ${data.stats[4].base_stat}`;
        document.getElementById('speedStat').textContent = `Speed:      ${data.stats[5].base_stat}`;
        document.getElementById('baseStatTotal').textContent = `Total:      ${baseStatTotal}`;
        for (const item of ['hpStat', 'atkStat', 'defStat', 'spAtkStat', 'spDefStat', 'speedStat', 'baseStatTotal']) {
            document.getElementById(item).style.whiteSpace = 'pre';
        }

        document.getElementById('damageMultipliers').style.display = 'block';
        let damageMultipliers = {};
        for (const item of data.types) {
            let typeName = item.type.name;
            let typeUrl = item.type.url;

            let typeResponse = await fetch(typeUrl);
            if (!typeResponse.ok) {
                throw new Error(`Could not fetch ${typeName} type data`)
            }
            let typeData = await typeResponse.json();

            let item2Name;
            for (const item2 of typeData.damage_relations.double_damage_from) {
                item2Name = item2.name;
                if (!Object.hasOwn(damageMultipliers, item2Name)) {
                    damageMultipliers[item2Name] = 2;
                }
                else {
                    damageMultipliers[item2Name] *= 2;
                }
            }
            for (const item2 of typeData.damage_relations.half_damage_from) {
                item2Name = item2.name;
                if (!Object.hasOwn(damageMultipliers, item2Name)) {
                    damageMultipliers[item2Name] = 0.5;
                }
                else {
                    damageMultipliers[item2Name] /= 2;
                }
            }
            for (const item2 of typeData.damage_relations.no_damage_from) {
                item2Name = item2.name;
                if (!Object.hasOwn(damageMultipliers, item2Name)) {
                    damageMultipliers[item2Name] = 0;
                }
                else {
                    damageMultipliers[item2Name] *= 0;
                }
            }
        }
        damageMultipliers = Object.fromEntries(
            Object.entries(damageMultipliers).filter(([k, v]) => v !== 1)
        );

        document.querySelectorAll('.damage-multipliers-content').forEach(el => el.remove());

        const damageDiv = document.getElementById('damage-multipliers-container');
        let newDiv, newImg, newH2;
        for (const [key, value] of Object.entries(damageMultipliers)) {
            newDiv = document.createElement('div');
            newDiv.classList.add('damage-multipliers-container');
            damageDiv.appendChild(newDiv);

            newImg = document.createElement('img');
            newImg.src = `images/pokemon_types/Type_${key.charAt(0).toUpperCase() + key.substring(1)}_HOME.webp`;
            newImg.classList.add('damage-multipliers-content');
            newDiv.appendChild(newImg);

            newH2 = document.createElement('h2');
            newH2.textContent = `${key.charAt(0).toUpperCase() + key.substring(1)}: x${value}`;
            newH2.classList.add('damage-multipliers-content');
            newDiv.appendChild(newH2);
        }

        const maleImg = document.getElementById('maleSprite');
        const femaleImg = document.getElementById('femaleSprite');

        const genderDiffText = document.getElementById('genderDifferencesText');
        genderDiffText.style.display = 'none';

        maleImg.src = '';
        maleImg.style.display = 'none';
        maleImg.title = '';
        document.getElementById('maleIcon').style.display = 'none';

        femaleImg.src = '';
        femaleImg.style.display = 'none';
        femaleImg.title = '';
        document.getElementById('femaleIcon').style.display = 'none';

        if (data.sprites.front_female) {
            genderDiffText.style.display = 'block';

            maleImg.src = pokemonSprite;
            maleImg.style.display = 'block';
            maleImg.title = `${name} male sprite`;
            document.getElementById('maleIcon').style.display = 'block';

            femaleImg.src = data.sprites.front_female;
            femaleImg.style.display = 'block';
            femaleImg.title = `${name} female sprite`;
            document.getElementById('femaleIcon').style.display = 'block';
        }

        document.querySelectorAll('.abilities').forEach(el => el.remove());
        document.getElementById('abilitiesText').style.display = 'block';
        for (const item of data.abilities) {
            newH2 = document.createElement('h2');
            if (item.is_hidden) {
                newH2.textContent = `  ${item.ability.name} (hidden)`;
            }
            else {
                newH2.textContent = `  ${item.ability.name}`;
            }
            newH2.classList.add('text', 'abilities');
            document.getElementById('abilities-container').appendChild(newH2);
        }

        document.getElementById('measurementsText').style.display = 'block';

        const heightM = data.height / 10;
        const heightIn = Math.round(heightM * 39, 3700787402);
        document.getElementById('height').textContent = `Height: ${heightM} m (${Math.floor(heightIn / 12)}'${Math.round(heightIn % 12)}")`;

        const weightKg = data.weight / 10;
        const weightLbs = Math.round(weightKg * 2.20462262185 * 10) / 10;
        document.getElementById('weight').textContent = `Weight: ${weightKg} kg (${weightLbs} lbs)`;

        const pokemonList = await getPokemonList();

        const preEvoText = document.getElementById('preEvoText');
        const preEvoNameHTML = document.getElementById('preEvoName');
        const preEvoType1HTML = document.getElementById('preEvoType1');
        const preEvoType2HTML = document.getElementById('preEvoType2');
        const preEvoSpeciesHTML = document.getElementById('preEvoSpecies');
        const preEvoImg = document.getElementById('preEvoImg');
        const preEvoPokedexNrHTML = document.getElementById('preEvoPokedexNr');
        const nextEvosText = document.getElementById('nextEvosText');
        for (const item of [preEvoText, preEvoNameHTML, preEvoType1HTML, preEvoType2HTML, preEvoSpeciesHTML, preEvoImg, preEvoPokedexNrHTML, nextEvosText]) {
            item.style.display = 'none';
        }

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        if (!evolutionResponse.ok) {
            throw new Error('Could not fetch evolution chain data');
        }
        const evolutionData = await evolutionResponse.json();

        let chainLength = 1;
        if (evolutionData.chain.evolves_to[0] !== undefined) {
            chainLength++;
            if (evolutionData.chain.evolves_to[0].evolves_to[0] !== undefined) {
                chainLength++;
            }
        }

        const nextEvosContainer = document.getElementById('nextEvos-container');
        document.querySelectorAll('.nextEvosContent').forEach(el => el.remove());

        if (chainLength >= 2) {
            if (evolutionData.chain.species.name === speciesName) {
                if (evolutionData.chain.evolves_to.length === 1) {
                    nextEvosText.textContent = 'Next Evolution:';
                }
                else {
                    nextEvosText.textContent = 'Next Evolutions:';
                }
                nextEvosText.style.display = 'block';

                let nextEvoNameTypeDiv, nextEvoNameHTML, nextEvoType1HTML, nextEvoType2HTML, nextEvoSpeciesHTML, nextEvoImg, nextEvoPokedexNrHTML;
                let nextEvoName, closestName, bestScore, currentScore, nextEvoResponse, nextEvoData, nextEvoType1, nextEvoType2, nextEvoSpeciesResponse, nextEvoSpeciesData, nextEvoSpecies, nextEvoPokedexNr;
                for (let i = 0; i < evolutionData.chain.evolves_to.length; i++) {
                    nextEvoNameTypeDiv = document.createElement('div');
                    nextEvoNameHTML = document.createElement('h2');
                    nextEvoType1HTML = document.createElement('img');
                    nextEvoType2HTML = document.createElement('img');
                    nextEvoSpeciesHTML = document.createElement('h2');
                    nextEvoImg = document.createElement('img');
                    nextEvoPokedexNrHTML = document.createElement('h2');

                    nextEvoName = evolutionData.chain.evolves_to[i].species.name;

                    try {
                        nextEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextEvoName}`);
                        if (!nextEvoResponse.ok) {
                            throw new Error('Could not fetch previous-evolution data');
                        }
                        nextEvoData = await nextEvoResponse.json();
                    }
                    catch(error) {
                        let bestScore = 0
                        let currentScore, closestName;
                        for(const item of pokemonList) {
                            if(!item.includes('-mega') && !item.includes('-gmax')) {
                                currentScore = similarityScore(item, nextEvoName);
                                if(currentScore > bestScore) {
                                    closestName = item;
                                }
                            }
                        }
                        nextEvoName = closestName;
                    
                        nextEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextEvoName}`);
                        if (!nextEvoResponse.ok) {
                            throw new Error('Could not fetch previous-evolution data');
                        }
                        nextEvoData = await nextEvoResponse.json();
                    }

                    nextEvoNameTypeDiv.classList.add('nextEvosContent', 'name-type-container');
                    nextEvosContainer.appendChild(nextEvoNameTypeDiv);

                    nextEvoNameHTML.classList.add('nextEvosContent', 'text', 'pokemonName', 'clickable')
                    nextEvoNameHTML.textContent = nextEvoName.charAt(0).toUpperCase() + nextEvoName.substring(1);
                    nextEvoNameHTML.setAttribute('onclick', `fetchNewInput(\'${nextEvoName}\'); window.scrollTo(0, 0);`);
                    nextEvoNameTypeDiv.appendChild(nextEvoNameHTML);

                    nextEvoType1HTML.classList.add('nextEvosContent');
                    nextEvoType1 = nextEvoData.types[0].type.name.charAt(0).toUpperCase() + nextEvoData.types[0].type.name.substring(1);
                    nextEvoType1HTML.src = `images/pokemon_types/Type_${nextEvoType1}_HOME.webp`;
                    nextEvoType1HTML.title = `${nextEvoType1} type`;
                    nextEvoNameTypeDiv.appendChild(nextEvoType1HTML);

                    if (nextEvoData.types.length === 2) {
                        nextEvoType2HTML.classList.add('nextEvosContent');
                        nextEvoType2 = nextEvoData.types[1].type.name.charAt(0).toUpperCase() + nextEvoData.types[1].type.name.substring(1);
                        nextEvoType2HTML.src = `images/pokemon_types/Type_${nextEvoType2}_HOME.webp`;
                        nextEvoType2HTML.title = `${nextEvoType2HTML} type`;
                        nextEvoNameTypeDiv.appendChild(nextEvoType2HTML);
                    }

                    nextEvoSpeciesResponse = await fetch(nextEvoData.species.url);
                    if (!nextEvoSpeciesResponse.ok) {
                        throw new Error('Could not fetch next-evolution species data');
                    }
                    nextEvoSpeciesData = await nextEvoSpeciesResponse.json();

                    for (const item of nextEvoSpeciesData.genera) {
                        if (item.language.name === 'en') {
                            nextEvoSpecies = item.genus;
                            break;
                        }
                    }
                    nextEvoSpeciesHTML.classList.add('nextEvosContent', 'text', 'pokemonSpecies');
                    nextEvoSpeciesHTML.textContent = 'The ' + nextEvoSpecies;
                    nextEvosContainer.appendChild(nextEvoSpeciesHTML);

                    nextEvoImg.classList.add('nextEvosContent', 'pokemonImages');
                    nextEvoImg.src = nextEvoData.sprites.front_default;
                    nextEvoImg.title = `${nextEvoName.charAt(0).toUpperCase() + nextEvoName.substring(1)} (next evolution) sprite`;
                    nextEvosContainer.appendChild(nextEvoImg);
                    switchTheme(state.usingTheme); // Updating the theme, so the image has the correct colour

                    for (const item of nextEvoSpeciesData.pokedex_numbers) {
                        if (item.pokedex.name === 'national') {
                            nextEvoPokedexNr = item.entry_number;
                            break;
                        }
                    }
                    nextEvoPokedexNrHTML.classList.add('nextEvosContent', 'text', 'pokedexNr');
                    nextEvoPokedexNrHTML.textContent = `Pokédex Nr. ${nextEvoPokedexNr}`;
                    nextEvosContainer.appendChild(nextEvoPokedexNrHTML);
                }
            }
            else {
                for (let i = 0; i < evolutionData.chain.evolves_to.length; i++) {
                    if (evolutionData.chain.evolves_to[i].species.name === speciesName) {
                        let preEvoName = evolutionData.chain.species.name;

                        let preEvoData;
                        try {
                            const preEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${preEvoName}`);
                            if (!preEvoResponse.ok) {
                                throw new Error('Could not fetch previous-evolution data');
                            }
                            preEvoData = await preEvoResponse.json();
                        }
                        catch(error) {
                            let bestScore = 0
                            let currentScore, closestName;
                            for(const item of pokemonList) {
                                if(!item.includes('-mega') && !item.includes('-gmax')) {
                                    currentScore = similarityScore(item, preEvoName);
                                    if(currentScore > bestScore) {
                                        closestName = item;
                                    }
                                }
                            }
                            preEvoName = closestName;
                        
                            const preEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${preEvoName}`);
                            if (!preEvoResponse.ok) {
                                throw new Error('Could not fetch previous-evolution data');
                            }
                            preEvoData = await preEvoResponse.json();
                        }

                        preEvoText.style.display = 'block';

                        preEvoNameHTML.textContent = preEvoName.charAt(0).toUpperCase() + preEvoName.substring(1);
                        preEvoNameHTML.style.display = 'block';
                        preEvoNameHTML.setAttribute('onclick', `fetchNewInput(\'${preEvoName}\'); window.scrollTo(0, 0);`);

                        const preEvoType1 = preEvoData.types[0].type.name.charAt(0).toUpperCase() + preEvoData.types[0].type.name.substring(1);
                        preEvoType1HTML.src = `images/pokemon_types/Type_${preEvoType1}_HOME.webp`;
                        preEvoType1HTML.style.display = 'block';
                        preEvoType1HTML.title = `${preEvoType1} type`;

                        if (preEvoData.types.length === 2) {
                            const preEvoType2 = preEvoData.types[1].type.name.charAt(0).toUpperCase() + preEvoData.types[1].type.name.substring(1);
                            preEvoType2HTML.src = `images/pokemon_types/Type_${preEvoType2}_HOME.webp`;
                            preEvoType2HTML.style.display = 'block';
                            preEvoType2HTML.title = `${preEvoType2HTML} type`;
                        }
                        else {
                            preEvoType2HTML.src = '';
                            preEvoType2HTML.style.display = 'none';
                        }

                        const preEvoSpeciesResponse = await fetch(preEvoData.species.url);
                        if (!preEvoSpeciesResponse.ok) {
                            throw new Error('Could not fetch previous-evolution species data');
                        }
                        const preEvoSpeciesData = await preEvoSpeciesResponse.json();

                        let preEvoSpecies;
                        for (const item of preEvoSpeciesData.genera) {
                            if (item.language.name === 'en') {
                                preEvoSpecies = item.genus;
                                break;
                            }
                        }
                        preEvoSpeciesHTML.textContent = 'The ' + preEvoSpecies;
                        preEvoSpeciesHTML.style.display = 'block';

                        preEvoImg.src = preEvoData.sprites.front_default;
                        preEvoImg.title = `${preEvoName.charAt(0).toUpperCase() + preEvoName.substring(1)} (previous evolution) sprite`;
                        preEvoImg.style.display = 'block';

                        let preEvoPokedexNr;
                        for (const item of preEvoSpeciesData.pokedex_numbers) {
                            if (item.pokedex.name === 'national') {
                                preEvoPokedexNr = item.entry_number;
                                break;
                            }
                        }
                        preEvoPokedexNrHTML.textContent = `Pokédex Nr. ${preEvoPokedexNr}`;
                        preEvoPokedexNrHTML.style.display = 'block';

                        if(chainLength > 2) {
                            if (evolutionData.chain.evolves_to[i].evolves_to.length === 1) {
                                nextEvosText.textContent = 'Next evolution:';
                            }
                            else {
                                nextEvosText.textContent = 'Next evolutions:';
                            }
                            nextEvosText.style.display = 'block';

                            let nextEvoNameTypeDiv, nextEvoNameHTML, nextEvoType1HTML, nextEvoType2HTML, nextEvoSpeciesHTML, nextEvoImg, nextEvoPokedexNrHTML;
                            let nextEvoName, nextEvoResponse, nextEvoData, nextEvoType1, nextEvoType2, nextEvoSpeciesResponse, nextEvoSpeciesData, nextEvoSpecies, nextEvoPokedexNr;
                            for (let j = 0; j < evolutionData.chain.evolves_to[i].evolves_to.length; j++) {
                                nextEvoNameTypeDiv = document.createElement('div');
                                nextEvoNameHTML = document.createElement('h2');
                                nextEvoType1HTML = document.createElement('img');
                                nextEvoType2HTML = document.createElement('img');
                                nextEvoSpeciesHTML = document.createElement('h2');
                                nextEvoImg = document.createElement('img');
                                nextEvoPokedexNrHTML = document.createElement('h2');

                                nextEvoName = evolutionData.chain.evolves_to[i].evolves_to[j].species.name;

                                try {
                                    nextEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextEvoName}`);
                                    if (!nextEvoResponse.ok) {
                                        throw new Error('Could not fetch previous-evolution data');
                                    }
                                    nextEvoData = await nextEvoResponse.json();
                                }
                                catch(error) {
                                    let bestScore = 0
                                    let currentScore, closestName;
                                    for(const item of pokemonList) {
                                        if(!item.includes('-mega') && !item.includes('-gmax')) {
                                            currentScore = similarityScore(item, nextEvoName);
                                            if(currentScore > bestScore) {
                                                closestName = item;
                                            }
                                        }
                                    }
                                    nextEvoName = closestName;
                                
                                    nextEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextEvoName}`);
                                    if (!nextEvoResponse.ok) {
                                        throw new Error('Could not fetch previous-evolution data');
                                    }
                                    const nextEvoData = await nextEvoResponse.json();
                                }

                                nextEvoNameTypeDiv.classList.add('nextEvosContent', 'name-type-container');
                                nextEvosContainer.appendChild(nextEvoNameTypeDiv);

                                nextEvoNameHTML.classList.add('nextEvosContent', 'text', 'pokemonName', 'clickable')
                                nextEvoNameHTML.textContent = nextEvoName.charAt(0).toUpperCase() + nextEvoName.substring(1);
                                nextEvoNameHTML.setAttribute('onclick', `fetchNewInput(\'${nextEvoName}\'); window.scrollTo(0, 0);`);
                                nextEvoNameTypeDiv.appendChild(nextEvoNameHTML);

                                nextEvoType1HTML.classList.add('nextEvosContent');
                                nextEvoType1 = nextEvoData.types[0].type.name.charAt(0).toUpperCase() + nextEvoData.types[0].type.name.substring(1);
                                nextEvoType1HTML.src = `images/pokemon_types/Type_${nextEvoType1}_HOME.webp`;
                                nextEvoType1HTML.title = `${nextEvoType1} type`;
                                nextEvoNameTypeDiv.appendChild(nextEvoType1HTML);

                                if (nextEvoData.types.length === 2) {
                                    nextEvoType2HTML.classList.add('nextEvosContent');
                                    nextEvoType2 = nextEvoData.types[1].type.name.charAt(0).toUpperCase() + nextEvoData.types[1].type.name.substring(1);
                                    nextEvoType2HTML.src = `images/pokemon_types/Type_${nextEvoType2}_HOME.webp`;
                                    nextEvoType2HTML.title = `${nextEvoType2HTML} type`;
                                    nextEvoNameTypeDiv.appendChild(nextEvoType2HTML);
                                }

                                nextEvoSpeciesResponse = await fetch(nextEvoData.species.url);
                                if (!nextEvoSpeciesResponse.ok) {
                                    throw new Error('Could not fetch next-evolution species data');
                                }
                                nextEvoSpeciesData = await nextEvoSpeciesResponse.json();

                                for (const item of nextEvoSpeciesData.genera) {
                                    if (item.language.name === 'en') {
                                        nextEvoSpecies = item.genus;
                                        break;
                                    }
                                }
                                nextEvoSpeciesHTML.classList.add('nextEvosContent', 'text', 'pokemonSpecies');
                                nextEvoSpeciesHTML.textContent = 'The ' + nextEvoSpecies;
                                nextEvosContainer.appendChild(nextEvoSpeciesHTML);

                                nextEvoImg.classList.add('nextEvosContent', 'pokemonImages');
                                nextEvoImg.src = nextEvoData.sprites.front_default;
                                nextEvoImg.title = `${nextEvoName.charAt(0).toUpperCase() + nextEvoName.substring(1)} (next evolution) sprite`;
                                nextEvosContainer.appendChild(nextEvoImg);
                                switchTheme(state.usingTheme); // Updating the theme, so the image has the correct colour

                                for (const item of nextEvoSpeciesData.pokedex_numbers) {
                                    if (item.pokedex.name === 'national') {
                                        nextEvoPokedexNr = item.entry_number;
                                        break;
                                    }
                                }
                                nextEvoPokedexNrHTML.classList.add('nextEvosContent', 'text', 'pokedexNr');
                                nextEvoPokedexNrHTML.textContent = `Pokédex Nr. ${nextEvoPokedexNr}`;
                                nextEvosContainer.appendChild(nextEvoPokedexNrHTML);
                            }
                        }

                        break;
                    }
                    else {
                        for (let j = 0; j < evolutionData.chain.evolves_to[i].evolves_to.length; j++) {
                            if (evolutionData.chain.evolves_to[i].evolves_to[j].species.name === speciesName) {
                                let preEvoName = evolutionData.chain.evolves_to[i].species.name;

                                let preEvoData;
                                try {
                                    const preEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${preEvoName}`);
                                    if (!preEvoResponse.ok) {
                                        throw new Error('Could not fetch previous-evolution data');
                                    }
                                    preEvoData = await preEvoResponse.json();
                                }
                                catch(error) {
                                    let bestScore = 0
                                    let currentScore, closestName;
                                    for(const item of pokemonList) {
                                        if(!item.includes('-mega') && !item.includes('-gmax')) {
                                            currentScore = similarityScore(item, preEvoName);
                                            if(currentScore > bestScore) {
                                                closestName = item;
                                            }
                                        }
                                    }
                                    preEvoName = closestName;

                                    const preEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${preEvoName}`);
                                    if (!preEvoResponse.ok) {
                                        throw new Error('Could not fetch previous-evolution data');
                                    }
                                    preEvoData = await preEvoResponse.json();
                                }

                                preEvoText.style.display = 'block';

                                preEvoNameHTML.textContent = preEvoName.charAt(0).toUpperCase() + preEvoName.substring(1);
                                preEvoNameHTML.style.display = 'block';
                                preEvoNameHTML.setAttribute('onclick', `fetchNewInput(\'${preEvoName}\'); window.scrollTo(0, 0);`);

                                const preEvoType1 = preEvoData.types[0].type.name.charAt(0).toUpperCase() + preEvoData.types[0].type.name.substring(1);
                                preEvoType1HTML.src = `images/pokemon_types/Type_${preEvoType1}_HOME.webp`;
                                preEvoType1HTML.style.display = 'block';
                                preEvoType1HTML.title = `${preEvoType1} type`;

                                if (preEvoData.types.length === 2) {
                                    const preEvoType2 = preEvoData.types[1].type.name.charAt(0).toUpperCase() + preEvoData.types[1].type.name.substring(1);
                                    preEvoType2HTML.src = `images/pokemon_types/Type_${preEvoType2}_HOME.webp`;
                                    preEvoType2HTML.style.display = 'block';
                                    preEvoType2HTML.title = `${preEvoType2HTML} type`;
                                }
                                else {
                                    preEvoType2HTML.src = '';
                                    preEvoType2HTML.style.display = 'none';
                                }

                                const preEvoSpeciesResponse = await fetch(preEvoData.species.url);
                                if (!preEvoSpeciesResponse.ok) {
                                    throw new Error('Could not fetch previous-evolution species data');
                                }
                                const preEvoSpeciesData = await preEvoSpeciesResponse.json();

                                for (const item of preEvoSpeciesData.genera) {
                                    if (item.language.name === 'en') {
                                        preEvoSpecies = item.genus;
                                        break;
                                    }
                                }
                                preEvoSpeciesHTML.textContent = 'The ' + preEvoSpecies;
                                preEvoSpeciesHTML.style.display = 'block';

                                preEvoImg.src = preEvoData.sprites.front_default;
                                preEvoImg.title = `${preEvoName.charAt(0).toUpperCase() + preEvoName.substring(1)} (previous evolution) sprite`;
                                preEvoImg.style.display = 'block';

                                for (const item of preEvoSpeciesData.pokedex_numbers) {
                                    if (item.pokedex.name === 'national') {
                                        preEvoPokedexNr = item.entry_number;
                                        break;
                                    }
                                }
                                preEvoPokedexNrHTML.textContent = `Pokédex Nr. ${preEvoPokedexNr}`;
                                preEvoPokedexNrHTML.style.display = 'block';

                                break;
                            }
                        }
                    }
                }
            }
        }

        document.querySelectorAll('.pokedexEntriesContent').forEach(el => el.remove());

        document.getElementById('pokedexEntriesText').style.display = 'block';

        const pokedexEntriesContainer = document.getElementById('pokedexEntries-container');
        let pokedexEntries = [];
        let included;
        for(const entry of speciesData.flavor_text_entries) {
            if(entry.language.name === 'en') {
                for(let i = 0; i < pokedexEntries.length; i++) {
                    included = false
                    if(pokedexEntries[i][1] === entry.flavor_text) {
                        included = true;
                        pokedexEntries[i][0].push(entry.version.name);
                        break;
                    }
                }
                if(!included) {
                    pokedexEntries.push([[entry.version.name], entry.flavor_text]);
                }
            }
        }

        let newP, newPokedexEntryTextContainerContainer, newPokedexEntrytextContainer, newPokedexEntryContainer; // also using old 'newH2' variable
        for(const entry of pokedexEntries) {
            newPokedexEntryTextContainerContainer = document.getElementById('pokedexEntries-container')
            newPokedexEntryTextContainerContainer = document.createElement('div');
            newPokedexEntryTextContainerContainer.classList.add('pokedexEntryText-container-container', 'pokedexEntriesContent');
            pokedexEntriesContainer.appendChild(newPokedexEntryTextContainerContainer);

            newPokedexEntrytextContainer = document.createElement('div');
            newPokedexEntrytextContainer.classList.add('pokedexEntryText-container', 'pokedexEntriesContent');
            newPokedexEntryTextContainerContainer.appendChild(newPokedexEntrytextContainer);

            for(const game of entry[0]) {
                newH2 = document.createElement('h2');
                newH2.classList.add('text', 'pokedexEntryText', 'pokedexEntriesContent');
                newH2.textContent = `${game}:`;
                newPokedexEntrytextContainer.appendChild(newH2);
            }

            newPokedexEntryContainer = document.createElement('div');
            newPokedexEntryContainer.classList.add('pokedexEntry-container', 'pokedexEntriesContent');
            newPokedexEntryTextContainerContainer.appendChild(newPokedexEntryContainer);

            newP = document.createElement('p');
            newP.classList.add('text', 'pokedexEntry', 'pokedexEntriesContent');
            newP.style['white-space'] = 'pre-line';
            newP.textContent = entry[1].replace('\f', '\n');
            newPokedexEntryContainer.appendChild(newP);
        }
    }
    catch (error) {
        console.error(error);
        document.getElementById('fetchText').textContent = 'Could not fetch data';

        if (error.message === 'Pokémon not found') {
            const didYou = document.getElementById('didYou');

            if (didYou !== null) { didYou.remove(); }
            document.querySelectorAll('.meanText').forEach(el => el.remove());

            const inputtedName = document.getElementById('pokemonInput').value.toLowerCase().replace(" ", "-");

            const top3ClosestPokemonNames = await get3ClosestNames(inputtedName);

            const didYouContainer = document.getElementById('didYou-container');
            let newP;
            newP = document.createElement('p');
            newP.id = 'didYou';
            newP.textContent = 'did you mean?:';
            didYouContainer.appendChild(newP);

            for (const name of top3ClosestPokemonNames) {
                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = name;
                newP.textContent = name;
                didYouContainer.appendChild(newP);
                newP.setAttribute('onclick', `fetchNewInput(\'${name}\'); window.scrollTo(0, 0); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());`);
            }
        }
    }
}

export async function fetchLocationData() {
    const didYou = document.getElementById('didYou');
    if (didYou !== null) {didYou.remove();}
    document.querySelectorAll('.meanText').forEach(el => el.remove());
    document.querySelectorAll('.locationsContent').forEach(el => el.remove());

    document.getElementById('regionInput').value = '';
    document.getElementById('areaInput').value = '';

    document.getElementById('fetchText').textContent = 'Fetching data...';
    try {
        const locationName = document.getElementById('locationInput').value.toLowerCase().replace(" ", "-");

        params.set('location', locationName);
        if(regionParam) {
            params.delete('region');
        }
        if(areaParam) {
            params.delete('area');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        const response = await fetch(`https://pokeapi.co/api/v2/location/${locationName}`);

        if (response.status === 404) {
            throw new Error('Location not found');
        }
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }
        document.getElementById('fetchText').textContent = 'Data fetched successfully';

        globalThis.locationData = await response.json();

        const locationsContainer = document.getElementById('locations-container');

        let newH2, newDiv;
        newH2 = document.createElement('h2');
        newH2.classList.add('text', 'clickable', 'locationText', 'locationsContent');
        newH2.textContent = `${locationData.name}:`;
        newH2.setAttribute('onclick', `
        const locationContainer = document.getElementById('location-container');
            switch(locationContainer.style.display) {
                case('none'): 
                    locationContainer.style.display = 'block'; break;
                default: 
                    locationContainer.style.display = 'none'; break;
            }`
        );
        locationsContainer.appendChild(newH2);

        newDiv = document.createElement('div');
        newDiv.classList.add('locationsContent');
        newDiv.id = 'location-container';
        locationsContainer.appendChild(newDiv);
        const locationContainer = document.getElementById('location-container');

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
    catch(error) {
        console.error(error);
        document.getElementById('fetchText').textContent = 'Could not fetch data';

        if (error.message === 'Location not found') {
            const didYou = document.getElementById('didYou');

            if (didYou !== null) { didYou.remove(); }
            document.querySelectorAll('.meanText').forEach(el => el.remove());

            const inputtedName = document.getElementById('locationInput').value.toLowerCase().replace(" ", "-");

            const top3ClosestLocationNames = await get3ClosestNames(inputtedName, 'locations');

            const didYouContainer = document.getElementById('didYou-container');
            let newP;
            newP = document.createElement('p');
            newP.id = 'didYou';
            newP.textContent = 'did you mean?:';
            didYouContainer.appendChild(newP);

            for (const name of top3ClosestLocationNames) {
                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = name;
                newP.textContent = name;
                didYouContainer.appendChild(newP);
                newP.setAttribute('onclick', `fetchNewLocationInput(\'${name}\'); window.scrollTo(0, 0); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());`);
            }
        }
    }
}

export async function fetchAreaData() {
    const didYou = document.getElementById('didYou');
    if (didYou !== null) {didYou.remove();}
    document.querySelectorAll('.meanText').forEach(el => el.remove());
    document.querySelectorAll('.locationsContent').forEach(el => el.remove());

    document.getElementById('locationInput').value = '';
    document.getElementById('regionInput').value = '';

    document.getElementById('fetchText').textContent = 'Fetching data...';
    try {
        const areaName = document.getElementById('areaInput').value.toLowerCase().replace(" ", "-");

        params.set('area', areaName);
        if(locationParam) {
            params.delete('location');
        }
        if(regionParam) {
            params.delete('region');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        const response = await fetch(`https://pokeapi.co/api/v2/location-area/${areaName}`);

        if (response.status === 404) {
            throw new Error('Area not found');
        }
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }
        document.getElementById('fetchText').textContent = 'Data fetched successfully';

        globalThis.areaData = await response.json();

        const locationsContainer = document.getElementById('locations-container');

        let newH2, newDiv;
        newH2 = document.createElement('h2');
        newH2.classList.add('text', 'clickable', 'areaText', 'locationsContent');
        newH2.textContent = `${areaData.name}:`;
        newH2.setAttribute('onclick', `
        const locationContainer = document.getElementById('area-container');
            switch(locationContainer.style.display) {
                case('none'): 
                    locationContainer.style.display = 'block'; break;
                default: 
                    locationContainer.style.display = 'none'; break;
            }`
        );
        locationsContainer.appendChild(newH2);

        newDiv = document.createElement('div');
        newDiv.classList.add('locationsContent');
        newDiv.id = 'area-container';
        locationsContainer.appendChild(newDiv);
        const areaContainer = document.getElementById('area-container');

        newH2 = document.createElement('h2');
        newH2.classList.add('title-text', 'clickable', 'locationsContent');
        newH2.textContent = 'Encounters:';
        newH2.setAttribute('onclick', `switch(document.getElementById('area-encounters-container').style.display) {
        case('none'): document.getElementById('area-encounters-container').style.display = 'block'; break;
        default: document.getElementById('area-encounters-container').style.display = 'none'; break;
        }`);
        areaContainer.appendChild(newH2);

        newDiv = document.createElement('div');
        newDiv.id = `area-encounters-container`;
        newDiv.classList.add('locationsContent');
        areaContainer.appendChild(newDiv);
        const encounterContainer = document.getElementById(`area-encounters-container`);

        let encounterNameTypeDiv, encounterNameHTML, encounterType1HTML, encounterType2HTML, encounterSpeciesHTML, encounterImg, encounterPokedexNrHTML;
        let encounterName, encounterUrl, encounterResponse, encounterData, encounterType1, encounterType2, encounterSpeciesResponse, encounterSpeciesData, encounterSpecies, encounterPokedexNr;
        let gamesText, gamesContainer, gameText, gameContainer, maxEncounterChanceText, encounterChanceText, encounterMethodText;
        for(const encounter of areaData.pokemon_encounters) {
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
            encounterNameHTML.setAttribute('onclick', `window.location.href = 'https://simonkamon11.github.io/monkadex/?pokemon=${encounterName}'`);
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
            encounterSpeciesHTML.classList.add('nextEvosContent', 'text', 'pokemonSpecies');
            encounterSpeciesHTML.textContent = 'The ' + encounterSpecies;
            encounterContainer.appendChild(encounterSpeciesHTML);

            encounterImg.classList.add('locationsContent', 'pokemonImages');
            encounterImg.src = encounterData.sprites.front_default;
            encounterImg.title = `${encounterName.charAt(0).toUpperCase() + encounterName.substring(1)} (next evolution) sprite`;
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
            switch(document.getElementById('area-${encounterName}-games-container').style.display) {
                case('none'): document.getElementById('area-${encounterName}-games-container').style.display = 'block'; break;
                default: document.getElementById('area-${encounterName}-games-container').style.display = 'none'; break;
            }`);
            if(encounter.version_details.length === 1) {
                gamesText.textContent = 'Game:';
            }
            else {
                gamesText.textContent = 'Games:';
            }
            encounterContainer.appendChild(gamesText);

            newDiv = document.createElement('div');
            newDiv.id = `area-${encounterName}-games-container`;
            newDiv.classList.add('locationsContent');
            encounterContainer.appendChild(newDiv);
            gamesContainer = document.getElementById(`area-${encounterName}-games-container`)

            for(const versionDetail of encounter.version_details) {
                gameText = document.createElement('h2');
                gameText.classList.add('text', 'clickable', 'gameText', 'locationsContent');
                gameText.setAttribute('onclick', `
                switch(document.getElementById('area-${encounterName}-${versionDetail.version.name}-container').style.display) {
                    case('none'): document.getElementById('area-${encounterName}-${versionDetail.version.name}-container').style.display = 'block'; break;
                    default: document.getElementById('area-${encounterName}-${versionDetail.version.name}-container').style.display = 'none'; break;
                }`);
                gameText.textContent = `${versionDetail.version.name}:`;
                gamesContainer.appendChild(gameText);

                newDiv = document.createElement('div');
                newDiv.id = `area-${encounterName}-${versionDetail.version.name}-container`;
                newDiv.classList.add('locationsContent');
                gamesContainer.appendChild(newDiv);
                gameContainer = document.getElementById(`area-${encounterName}-${versionDetail.version.name}-container`);

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
    catch(error) {
        console.error(error);
        document.getElementById('fetchText').textContent = 'Could not fetch data';

        if (error.message === 'Area not found') {
            const didYou = document.getElementById('didYou');

            if (didYou !== null) { didYou.remove(); }
            document.querySelectorAll('.meanText').forEach(el => el.remove());

            const inputtedName = document.getElementById('areaInput').value.toLowerCase().replace(" ", "-");

            const top3ClosestLocationNames = await get3ClosestNames(inputtedName, 'areas');

            const didYouContainer = document.getElementById('didYou-container');
            let newP;
            newP = document.createElement('p');
            newP.id = 'didYou';
            newP.textContent = 'did you mean?:';
            didYouContainer.appendChild(newP);

            for (const name of top3ClosestLocationNames) {
                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = name;
                newP.textContent = name;
                didYouContainer.appendChild(newP);
                newP.setAttribute('onclick', `fetchNewAreaInput(\'${name}\'); window.scrollTo(0, 0); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());`);
            }
        }
    }
}

export async function fetchRegionData() {
    const didYou = document.getElementById('didYou');
    if (didYou !== null) {didYou.remove();}
    document.querySelectorAll('.meanText').forEach(el => el.remove());
    document.querySelectorAll('.locationsContent').forEach(el => el.remove());

    document.getElementById('locationInput').value = '';
    document.getElementById('areaInput').value = '';

    document.getElementById('fetchText').textContent = 'Fetching data...';
    try {
        const regionName = document.getElementById('regionInput').value.toLowerCase().replace(" ", "-");

        params.set('region', regionName);
        if(locationParam) {
            params.delete('location');
        }
        if(areaParam) {
            params.delete('area');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        const response = await fetch(`https://pokeapi.co/api/v2/region/${regionName}`);

        if (response.status === 404) {
            throw new Error('Region not found');
        }
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }
        document.getElementById('fetchText').textContent = 'Data fetched successfully';

        globalThis.regionData = await response.json();

        const locationsContainer = document.getElementById('locations-container');

        let newH2, newDiv;
        newH2 = document.createElement('h2');
        newH2.classList.add('text', 'clickable', 'regionText', 'locationsContent');
        newH2.textContent = `${regionData.name}:`;
        newH2.setAttribute('onclick', `
        const regionContainer = document.getElementById('region-container');
            switch(regionContainer.style.display) {
                case('none'): 
                    regionContainer.style.display = 'block'; break;
                default: 
                    regionContainer.style.display = 'none'; break;
            }`
        );
        locationsContainer.appendChild(newH2);

        newDiv = document.createElement('div');
        newDiv.classList.add('locationsContent');
        newDiv.id = 'region-container';
        locationsContainer.appendChild(newDiv);
        const regionContainer = document.getElementById('region-container');

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
    catch(error) {
        console.error(error);
        document.getElementById('fetchText').textContent = 'Could not fetch data';

        if (error.message === 'Region not found') {
            const didYou = document.getElementById('didYou');

            if (didYou !== null) { didYou.remove(); }
            document.querySelectorAll('.meanText').forEach(el => el.remove());

            const inputtedName = document.getElementById('regionInput').value.toLowerCase().replace(" ", "-");

            const top3ClosestLocationNames = await get3ClosestNames(inputtedName, 'regions');

            const didYouContainer = document.getElementById('didYou-container');
            let newP;
            newP = document.createElement('p');
            newP.id = 'didYou';
            newP.textContent = 'did you mean?:';
            didYouContainer.appendChild(newP);

            for (const name of top3ClosestLocationNames) {
                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = name;
                newP.textContent = name;
                didYouContainer.appendChild(newP);
                newP.setAttribute('onclick', `fetchNewRegionInput(\'${name}\'); window.scrollTo(0, 0); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());`);
            }
        }
    }
}

export async function fetchRegionsData() {
    try {
        const regionsResponse = await fetch('https://pokeapi.co/api/v2/region/');
        if(!regionsResponse.ok) {
            throw new Error('Could not fetch regions data');
        }
        globalThis.regionsData = await regionsResponse.json();

        document.querySelectorAll('.locationsContent').forEach(el => el.remove());
        const regionsContainer = document.getElementById('locations-container');
        let newH2, newDiv;
        for(const region of regionsData.results) {
            newH2 = document.createElement('h2');
            newH2.classList.add('text', 'clickable', 'regionText', 'locationsContent');
            newH2.textContent = `${region.name}:`;
            newH2.setAttribute('onclick', `regionClicked('${region.name}');`);
            regionsContainer.appendChild(newH2);

            newDiv = document.createElement('div');
            newDiv.classList.add('locationsContent');
            newDiv.id = `${region.name}-container`;
            newDiv.style.display = 'none';
            regionsContainer.appendChild(newDiv);
        }
    }
    catch(error) {
        console.error(error);
    }
}

export async function fetchShinyData() {
    const didYou = document.getElementById('didYou');
    if (didYou !== null) {didYou.remove();}
    document.querySelectorAll('.meanText').forEach(el => el.remove());

    document.getElementById('fetchText').textContent = 'Fetching data...';
    try {
        const pokemonName = document.getElementById('shinyInput').value.toLowerCase().replace(" ", "-");

        params.set('pokemon', pokemonName);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        localStorage.setItem('pokemon', pokemonName);

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if (response.status === 404) {
            throw new Error('Pokémon not found');
        }
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }

        const data = await response.json();

        const speciesResponse = await fetch(data.species.url);
        if (!speciesResponse.ok) {
            throw new Error('Could not fetch species data');
        }
        document.getElementById('fetchText').textContent = 'Data fetched successfully';

        const speciesData = await speciesResponse.json();

        const speciesName = speciesData.name;

        const shinySprite = data.sprites.front_shiny;

        const name = data.name.charAt(0).toUpperCase() + data.name.substring(1)

        const pokemonNameHTML = document.getElementById('pokemonName');
        pokemonNameHTML.textContent = name;
        pokemonNameHTML.setAttribute('onclick', `window.location.href = 'https://simonkamon11.github.io/monkadex/?pokemon=${pokemonName}&theme=${params.get('theme')}'`);

        const type1Img = document.getElementById('type1');
        const type1 = data.types[0].type.name.charAt(0).toUpperCase() + data.types[0].type.name.substring(1);
        type1Img.src = `../images/pokemon_types/Type_${type1}_HOME.webp`;
        type1Img.style.display = 'block';
        type1Img.title = `${type1} type`;

        const type2Img = document.getElementById('type2');
        if (data.types.length === 2) {
            const type2 = data.types[1].type.name.charAt(0).toUpperCase() + data.types[1].type.name.substring(1);
            type2Img.src = `../images/pokemon_types/Type_${type2}_HOME.webp`;
            type2Img.style.display = 'block';
            type2Img.title = `${type2} type`;
        }
        else {
            type2Img.src = '';
            type2Img.style.display = 'none';
        }

        let pokemonSpecies;
        for (const item of speciesData.genera) {
            if (item.language.name === 'en') {
                pokemonSpecies = item.genus;
                break;
            }
        }
        document.getElementById('pokemonSpecies').textContent = 'The ' + pokemonSpecies;

        const imgShiny = document.getElementById('shinySprite');
        imgShiny.src = shinySprite;
        imgShiny.style.display = 'block';
        imgShiny.title = `${name} shiny sprite`;
        document.getElementById('shiny-sparkles').style.display = 'block';

        let pokedexNr;
        for (const item of speciesData.pokedex_numbers) {
            if (item.pokedex.name === 'national') {
                pokedexNr = item.entry_number;
                break;
            }
        }

        document.getElementById('pokedexNr').textContent = `Pokédex Nr. ${pokedexNr}`;
    }
    catch(error) {
        console.error(error);
        document.getElementById('fetchText').textContent = 'Could not fetch data';

        if (error.message === 'Pokémon not found') {
            const didYou = document.getElementById('didYou');

            if (didYou !== null) { didYou.remove(); }
            document.querySelectorAll('.meanText').forEach(el => el.remove());

            const inputtedName = document.getElementById('pokemonInput').value.toLowerCase().replace(" ", "-");

            const top3ClosestPokemonNames = await get3ClosestNames(inputtedName);

            const didYouContainer = document.getElementById('didYou-container');
            let newP;
            newP = document.createElement('p');
            newP.id = 'didYou';
            newP.textContent = 'did you mean?:';
            didYouContainer.appendChild(newP);

            for (const name of top3ClosestPokemonNames) {
                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = name;
                newP.textContent = name;
                didYouContainer.appendChild(newP);
                newP.setAttribute('onclick', `fetchNewInput(\'${name}\'); window.scrollTo(0, 0); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());`);
            }
        }
    }
}

export async function fetchGameData() {
    const didYou = document.getElementById('gameDidYou');
    if (didYou !== null) { didYou.remove(); }
    document.querySelectorAll('.gameMeanText').forEach(el => el.remove());

    document.getElementById('fetchGameText').textContent = 'Fetching data...';
    try {
        const gameName = document.getElementById('gameInput').value.toLowerCase().replace(" ", "-");

        if(!params.get('pokemon')) {
            throw new Error('Please use shiny search for pokémon');
        }
        const pokemonName = params.get('pokemon');

        params.set('game', gameName);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        let response = await fetch(`https://pokeapi.co/api/v2/version-group/${gameName}`);
        let data;
        let versionList = [];
        if(response.status === 404) {
            response = await fetch(`https://pokeapi.co/api/v2/version/${gameName}`);
            if(response.status === 404) {
                throw new Error('Game not found');
            }
            if(!response.ok) {
                throw new Error('Could not fetch data');
            }
            data = await response.json();
            versionList.push(data.name);

            response = await fetch(data.version_group.url);
            if(!response.ok) {
                throw new Error('Could not fetch data');
            }
            data = await response.json();
        }
        else {
            if(!response.ok) {
                throw new Error('Could not fetch data');
            }
            data = await response.json();

            for(const version of data.versions) {
                versionList.push(version.name);
            }
        }
        document.getElementById('fetchGameText').textContent = 'Data fetched successfully';

        let urls = [];
        for(const region of data.regions) {
            urls.push(region.url);
        }
        
        let responses = await Promise.all(urls.map(url => fetch(url)));
        const regionsData = await Promise.all(responses.map(res => res.json()));
        urls = regionsData.map(reg => reg.locations.map(loc => loc.url)).flat();
        
        responses = await Promise.all(urls.map(url => fetch(url)));
        const locationsData = await Promise.all(responses.map(res => res.json()));
        urls = locationsData.map(loc => loc.areas.map(area => area.url)).flat();
        
        responses = await Promise.all(urls.map(url => fetch(url)));
        const areasData = await Promise.all(responses.map(res => res.json()));

        document.querySelectorAll('.locationsContent').forEach(el => el.remove());
        const areasContainer = document.getElementById('areas-container');
        let newH2, newDiv, areaContainer, gamesContainer;
        let inGame = false;
        for(const area of areasData.filter(area => area.pokemon_encounters.map(enc => enc.pokemon.name).includes(pokemonName)).sort((a, b) => 
            Math.max(...b.pokemon_encounters.map(enc => enc.version_details.filter(det => versionList.includes(det.version.name)).map(det => det.max_chance)).flat()) 
            - Math.max(...a.pokemon_encounters.map(enc => enc.version_details.filter(det => versionList.includes(det.version.name)).map(det => det.max_chance)).flat()))) {
            if(area.pokemon_encounters.map(enc => enc.pokemon.name).includes(pokemonName)) {
                if(area.pokemon_encounters
                    .filter(enc => enc.pokemon.name === pokemonName)
                    .map(enc => enc.version_details.map(det => det.version.name)).flat()
                    .filter(el => versionList.includes(el)).length >= 1) {
                    inGame = true;
                    newH2 = document.createElement('h2');
                    newH2.classList.add('text', 'clickable', 'areaText', 'locationsContent');
                    newH2.textContent = `${area.name}:`;
                    newH2.setAttribute('onclick', `
                        switch(document.getElementById('${area.name}-container').style.display) {
                            case('none'): document.getElementById('${area.name}-container').style.display = 'block'; break;
                            default: document.getElementById('${area.name}-container').style.display = 'none'; break;
                        }`
                    );
                    areasContainer.appendChild(newH2);

                    newDiv = document.createElement('div');
                    newDiv.id = `${area.name}-container`;
                    newDiv.classList.add( 'locationsContent');
                    areasContainer.appendChild(newDiv);
                    areaContainer = document.getElementById(`${area.name}-container`);

                    for(const encounter of area.pokemon_encounters) {
                        if(encounter.pokemon.name === pokemonName) {
                            newH2 = document.createElement('h2');
                            newH2.classList.add('text', 'clickable', 'gamesText', 'locationsContent');
                            newH2.textContent = `Games:`;
                            newH2.setAttribute('onclick', `
                                switch(document.getElementById('${area.name}-games-container').style.display) {
                                    case('none'): document.getElementById('${area.name}-games-container').style.display = 'block'; break;
                                    default: document.getElementById('${area.name}-games-container').style.display = 'none'; break;
                                }`
                            );
                            areaContainer.appendChild(newH2);

                            newDiv = document.createElement('div');
                            newDiv.id = `${area.name}-games-container`;
                            newDiv.classList.add( 'locationsContent');
                            areaContainer.appendChild(newDiv);
                            gamesContainer = document.getElementById(`${area.name}-games-container`);

                            for(const verDetail of encounter.version_details.sort((a, b) => b.max_chance - a.max_chance)) {
                                if(versionList.includes(verDetail.version.name)) {
                                    newH2 = document.createElement('h2');
                                    newH2.classList.add('text', 'gameText', 'locationsContent');
                                    newH2.setAttribute('onclick', `fetchNewGameInput(${verDetail.version.name})`);
                                    newH2.textContent = `${verDetail.version.name}:`;
                                    gamesContainer.appendChild(newH2);

                                    newH2 = document.createElement('h2');
                                    newH2.classList.add('text', 'maxEncounterChanceText', 'locationsContent');
                                    newH2.textContent = `Max encounter chance: ${verDetail.max_chance}%`;
                                    gamesContainer.appendChild(newH2);

                                    for(const encDetail of verDetail.encounter_details.sort((a, b) => b.max_chance - a.max_chance)) {
                                        newH2 = document.createElement('h2');
                                        newH2.classList.add('text', 'encounterChanceText', 'locationsContent');
                                        newH2.textContent = `Encounter chance: ${encDetail.chance}%`;
                                        gamesContainer.appendChild(newH2);
                                        
                                        newH2 = document.createElement('h2');
                                        newH2.classList.add('text', 'encounterMethodText', 'locationsContent');
                                        newH2.textContent = `Encounter method: ${encDetail.method.name}`;
                                        gamesContainer.appendChild(newH2);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if(!inGame) {
            throw new Error('Not in game');
        }
    }
    catch(error) {
        console.error(error);
        document.getElementById('fetchGameText').textContent = 'Could not fetch data';

        if(error.message === 'Game not found') {
            const didYou = document.getElementById('gameDidYou');

            if (didYou !== null) {didYou.remove();}
            document.querySelectorAll('.gameMeanText').forEach(el => el.remove());

            const inputtedName = document.getElementById('gameInput').value.toLowerCase().replace(" ", "-");

            const top3ClosestPokemonNames = await get3ClosestNames(inputtedName, 'games');

            const didYouContainer = document.getElementById('gameDidYou-container');
            let newP;
            newP = document.createElement('p');
            newP.id = 'gameDidYou';
            newP.textContent = 'did you mean?:';
            didYouContainer.appendChild(newP);

            for (const name of top3ClosestPokemonNames) {
                newP = document.createElement('p');
                newP.classList.add('gameMeanText', 'clickable');
                newP.id = name;
                newP.textContent = name;
                didYouContainer.appendChild(newP);
                newP.setAttribute('onclick', `fetchNewGameInput(\'${name}\'); window.scrollTo(0, 0); document.getElementById(\'gameDidYou\').remove(); document.querySelectorAll(\'.gameMeanText\').forEach(el => el.remove());`);
            }
        }
        else if(error.message === 'Please use shiny search for pokémon') {
            const didYou = document.getElementById('GameDidYou');

            if(didYou !== null) {didYou.remove();}
            document.querySelectorAll('.gameMeanText').forEach(el => el.remove());

            const didYouContainer = document.getElementById('gameDidYou-container');
            let newP;
            newP = document.createElement('p');
            newP.id = 'gameDidYou';
            newP.textContent = 'please use shiny search';
            didYouContainer.appendChild(newP);
        }
        else if(error.message === 'Not in game') {
            const didYou = document.getElementById('GameDidYou');

            if(didYou !== null) {didYou.remove();}
            document.querySelectorAll('.gameMeanText').forEach(el => el.remove());

            document.getElementById('fetchGameText').textContent = `Could not find '${params.get('pokemon')}' in '${document.getElementById('gameInput').value}'`;
        }
    }
}

export async function fetchMoveData() {

}

export async function fetchMovesData() {
    
}