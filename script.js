if (window.location.pathname.endsWith("/about/") || window.location.pathname.endsWith("/about/index.html")) {
    setupAbout();
}
else {
    setupIndexPage();
}

function setupIndexPage() {
    globalThis.params = new URLSearchParams(window.location.search);

    globalThis.pokemonParam = params.get('pokemon');
    if (pokemonParam) {
        fetchNewInput(pokemonParam);
    }
    globalThis.usingTheme;
    globalThis.themeParam = params.get('theme');
    if (themeParam) {
        switchTheme(themeParam);
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

function setupAbout() {
    const params = new URLSearchParams(window.location.search);

    const themeParam = params.get('theme');

    let colour1, colour2;
    if (themeParam === 'dark') {
        colour1 = 'rgb(40, 40, 40)';
        colour2 = 'rgb(170, 170, 170)';
    }
    else if(themeParam === 'light') {
        colour1 = 'rgb(255, 255, 255)';
        colour2 = 'rgb(0, 0, 0)';
    }
    else {
        if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
            colour1 = 'rgb(40, 40, 40)';
            colour2 = 'rgb(170, 170, 170)';
        }
        else {
            colour1 = 'rgb(255, 255, 255)';
            colour2 = 'rgb(0, 0, 0)';
        }
    }

    aboutBody = document.getElementById('about-body');
    aboutBody.style['background-color'] = colour1;
    aboutBody.style['color'] = colour2;

    border = document.getElementById('about-page-border');
    border.style['background-color'] = colour2
}

async function fetchData() {
    const didYou = document.getElementById('didYou');
    if (didYou !== null) { didYou.remove(); }
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
            throw new Error('Could not fetch species data')
        }
        document.getElementById('fetchText').textContent = 'Data fetched successfully';

        const speciesData = await speciesResponse.json();

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

        damageDiv = document.getElementById('damage-multipliers-container');
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
            if (evolutionData.chain.species.name === pokemonName) {
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

                    bestScore = 0
                    for(const item of pokemonList) {
                        currentScore = similarityScore(item, nextEvoName);
                        if(currentScore > bestScore) {
                            closestName = item;
                        }
                    }
                    nextEvoName = closestName;

                    nextEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextEvoName}`);
                    if (!nextEvoResponse.ok) {
                        throw new Error('Could not fetch next-evolution data');
                    }
                    nextEvoData = await nextEvoResponse.json();

                    nextEvoNameTypeDiv.classList.add('nextEvosContent', 'name-type-container');
                    nextEvosContainer.appendChild(nextEvoNameTypeDiv);

                    nextEvoNameHTML.classList.add('nextEvosContent', 'text', 'pokemonName', 'clickable')
                    nextEvoNameHTML.textContent = nextEvoName.charAt(0).toUpperCase() + nextEvoName.substring(1);
                    nextEvoNameHTML.setAttribute('onclick', `fetchNewInput(\'${nextEvoName}\'); window.scrollTo(0, 0);`);
                    nextEvoNameTypeDiv.appendChild(nextEvoNameHTML);

                    nextEvoType1HTML.classList.add('nextEvosContent');
                    nextEvoType1 = nextEvoData.types[0].type.name.charAt(0).toUpperCase() + nextEvoData.types[0].type.name.substring(1);
                    nextEvoType1HTML.src = `images/pokemon_types/Type_${nextEvoType1}_HOME.webp`;
                    nextEvoType1HTML.title = `${preEvoType1} type`;
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
                    switchTheme(usingTheme); // Updating the theme, so the image has the correct colour

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
                    if (evolutionData.chain.evolves_to[i].species.name === pokemonName) {
                        let preEvoName = evolutionData.chain.species.name;

                        let bestScore = 0
                        let currentScore, closestName;
                        for(const item of pokemonList) {
                            currentScore = similarityScore(item,preEvoName);
                            if(currentScore > bestScore) {
                                closestName = item;
                            }
                        }
                        preEvoName = closestName;

                        const preEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${preEvoName}`);
                        if (!preEvoResponse.ok) {
                            throw new Error('Could not fetch previous-evolution data');
                        }
                        const preEvoData = await preEvoResponse.json();

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

                                bestScore = 0
                                for(const item of pokemonList) {
                                    currentScore = similarityScore(item, nextEvoName);
                                    if(currentScore > bestScore) {
                                        closestName = item;
                                    }
                                }
                                nextEvoName = closestName;

                                nextEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextEvoName}`);
                                if (!nextEvoResponse.ok) {
                                    throw new Error('Could not fetch next-evolution data');
                                }
                                nextEvoData = await nextEvoResponse.json();

                                nextEvoNameTypeDiv.classList.add('nextEvosContent', 'name-type-container');
                                nextEvosContainer.appendChild(nextEvoNameTypeDiv);

                                nextEvoNameHTML.classList.add('nextEvosContent', 'text', 'pokemonName', 'clickable')
                                nextEvoNameHTML.textContent = nextEvoName.charAt(0).toUpperCase() + nextEvoName.substring(1);
                                nextEvoNameHTML.setAttribute('onclick', `fetchNewInput(\'${nextEvoName}\'); window.scrollTo(0, 0);`);
                                nextEvoNameTypeDiv.appendChild(nextEvoNameHTML);

                                nextEvoType1HTML.classList.add('nextEvosContent');
                                nextEvoType1 = nextEvoData.types[0].type.name.charAt(0).toUpperCase() + nextEvoData.types[0].type.name.substring(1);
                                nextEvoType1HTML.src = `images/pokemon_types/Type_${nextEvoType1}_HOME.webp`;
                                nextEvoType1HTML.title = `${preEvoType1} type`;
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
                                switchTheme(usingTheme); // Updating the theme, so the image has the correct colour

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
                            if (evolutionData.chain.evolves_to[i].evolves_to[j].species.name === pokemonName) {
                                let preEvoName = evolutionData.chain.evolves_to[i].species.name;

                                let bestScore = 0
                                let currentScore, closestName;
                                for(const item of pokemonList) {
                                    currentScore = similarityScore(item,preEvoName);
                                    if(currentScore > bestScore) {
                                        closestName = item;
                                    }
                                }
                                preEvoName = closestName;

                                const preEvoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${preEvoName}`);
                                if (!preEvoResponse.ok) {
                                    throw new Error('Could not fetch previous-evolution data');
                                }
                                const preEvoData = await preEvoResponse.json();

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

        pokedexEntriesContainer = document.getElementById('pokedexEntries-container');
        pokedexEntries = [];
        let included; // also using old 'newH2' variable
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
        console.log(pokedexEntries);

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

            const top3ClosestPokemonNames = await get3ClosestPokemonNames(inputtedName);

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

function fetchNewInput(text) {
    document.getElementById('pokemonInput').value = text;
    fetchData();
}

function switchTheme(theme) {
    usingTheme = theme

    params.set('theme', theme);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    themes = {
        dark: ['rgb(40, 40, 40)', 'rgb(170, 170, 170)', 'rgb(80, 80, 80)'],
        light: ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(200, 200, 200)'],
        pokedex: ['rgb(220, 10, 45)', 'rgb(0, 0, 0)', 'rgb(41, 170, 253)'],
        gameboy: ['rgb(155, 188, 15)', 'rgb(15, 56, 15)', 'rgb(139, 172, 15)'],
        ultraball: ['rgb(40, 40, 40)', 'rgb(253, 209, 60)', 'rgb(30, 30, 30)'],
        premier: ['rgb(255, 255, 255)', 'rgb(220, 10, 45)', 'rgb(255, 255, 255)'],
        black: ['rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(40, 40, 40)']
    }

    if(!themes.hasOwnProperty(theme)) {
        console.error('Invalid theme set for theme parameter');
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            switchTheme('dark');
            return;
        }
        else {
            switchTheme('pokedex');
            return;
        }
    }

    indexBody = document.getElementById('index-body');
    indexBody.style['background-color'] = themes[theme][0];
    indexBody.style['color'] = themes[theme][1];


    const fetchButton = document.getElementById('fetch-button');
    fetchButton.style['background-color'] = themes[theme][2];
    fetchButton.style['color'] = themes[theme][1];
    fetchButton.style['border-color'] = themes[theme][1];

    document.getElementById('pokemonInput').style['border-color'] = themes[theme][1];

    document.getElementById('themes-text-container').style['background'] = themes[theme][2];

    document.getElementById('themes-text').style['color'] = themes[theme][1];
    document.querySelectorAll('.theme').forEach(element => {
        element.style['color'] = themes[theme][1];
    });

    document.querySelectorAll('.pokemonImages').forEach(element => {
        element.style['background-color'] = themes[theme][2];
        element.style['border-color'] = themes[theme][1];
    });
}

async function getPokemonList() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=100000&offset=0');
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }

        const data = await response.json();

        let pokemonList = [];
        for (const pokemon of data.results) {
            pokemonList.push(pokemon.name);
        }

        return pokemonList;
    }
    catch (error) {
        console.error(error);
        return [];
    }
}

// The code below was heavily assisted by the OpenAI chatbot ChatGPT
async function get3ClosestPokemonNames(input) {
    let pokemonNames = await getPokemonList();

    const top3ClosestPokemonNames = pokemonNames
        .map(name => ({
            name,
            score: similarityScore(input, name)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.name);

    return top3ClosestPokemonNames;
}


function levenshtein(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;

    const matrix = Array.from({ length: rows }, () =>
        Array(cols).fill(0)
    );

    for (let i = 0; i < rows; i++) {
        matrix[i][0] = i;
    }

    for (let j = 0; j < cols; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {

            const cost = a[i - 1] === b[j - 1] ? 0 : 1;

            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[a.length][b.length];
}

function similarityScore(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();

    let score = -levenshtein(a, b);

    if (a.includes(b) || b.includes(a)) {
        score += 1000;
    }

    return score;
}