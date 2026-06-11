switchTheme('pokedex');

async function fetchData() {
    
    document.getElementById('fetchText').textContent = 'Fetching data...';
    try {
        const pokemonName = document.getElementById('pokemonInput').value.toLowerCase().replace(" ", "-");
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if(!response.ok) {
            throw new Error('Could not fetch data');
        }

        const data = await response.json();

        const speciesResponse = await fetch(data.species.url);
        if(!speciesResponse.ok) {
            throw new Error('Could not fetch species data')
        }
        document.getElementById('fetchText').textContent = 'Data fetched successfully';

        const speciesData = await speciesResponse.json();

        let baseStatTotal = 0;
        for(const item of data.stats) {
            baseStatTotal += item.base_stat;
        }

        const pokemonSprite = data.sprites.front_default;
        const shinySprite = data.sprites.front_shiny;

        const name = data.name.charAt(0).toUpperCase() + data.name.substring(1)
        
        document.getElementById('pokemonName').textContent = name;

        type1Img = document.getElementById('type1');
        type1 = data.types[0].type.name.charAt(0).toUpperCase() + data.types[0].type.name.substring(1);
        type1Img.src = `images/pokemon_types/Type_${type1}_HOME.webp`;
        type1Img.style.display = 'block';
        type1Img.title = `${type1} type`;

        if(data.types.length === 2) {
            type2Img = document.getElementById('type2');
            type2 = data.types[1].type.name.charAt(0).toUpperCase() + data.types[1].type.name.substring(1);
            type2Img.src = `images/pokemon_types/Type_${type2}_HOME.webp`;
            type2Img.style.display = 'block';
            type2Img.title = `${type2} type`;
        }

        for(const item of speciesData.genera) {
            if(item.language.name === 'en') {
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

        for(const item of speciesData.pokedex_numbers) {
            if(item.pokedex.name === 'national') {
                pokedexNr = item.entry_number;
                break;
            }
        }

        document.getElementById('pokedexNr').textContent = `Pokédex Nr. ${pokedexNr}`;

        document.getElementById('hpStat').textContent = `HP:         ${data.stats[0].base_stat}`;
        document.getElementById('hpStat').style.whiteSpace = 'pre';
        document.getElementById('atkStat').textContent = `Attack:     ${data.stats[1].base_stat}`;
        document.getElementById('atkStat').style.whiteSpace = 'pre';
        document.getElementById('defStat').textContent = `defence:    ${data.stats[2].base_stat}`;
        document.getElementById('defStat').style.whiteSpace = 'pre';
        document.getElementById('spAtkStat').textContent = `Sp. Atk:    ${data.stats[3].base_stat}`;
        document.getElementById('spAtkStat').style.whiteSpace = 'pre';
        document.getElementById('spDefStat').textContent = `Sp. Def:    ${data.stats[4].base_stat}`;
        document.getElementById('spDefStat').style.whiteSpace = 'pre';
        document.getElementById('speedStat').textContent = `Speed:      ${data.stats[5].base_stat}`;
        document.getElementById('speedStat').style.whiteSpace = 'pre';
        document.getElementById('baseStatTotal').textContent = `Total:      ${baseStatTotal}`;
        document.getElementById('baseStatTotal').style.whiteSpace = 'pre';

        document.getElementById('damageMultipliers').textContent = 'Damage multipliers:';
        let damageMultipliers = {};
        for(const item of data.types) {
            let typeName = item.type.name;
            let typeUrl = item.type.url;

            let typeResponse = await fetch(typeUrl);
            if(!typeResponse.ok) {
                throw new Error(`Could not fetch ${typeName} type data`)
            }
            let typeData = await typeResponse.json();
            
            let item2Name;
            for(const item2 of typeData.damage_relations.double_damage_from) {
                item2Name = item2.name;
                if(!Object.hasOwn(damageMultipliers, item2Name)) {
                    damageMultipliers[item2Name] = 2;
                }
                else {
                    damageMultipliers[item2Name] *= 2;
                }
            }
            for(const item2 of typeData.damage_relations.half_damage_from) {
                item2Name = item2.name;
                if(!Object.hasOwn(damageMultipliers, item2Name)) {
                    damageMultipliers[item2Name] = 0.5;
                }
                else {
                    damageMultipliers[item2Name] /= 2;
                }
            }
            for(const item2 of typeData.damage_relations.no_damage_from) {
                item2Name = item2.name;
                if(!Object.hasOwn(damageMultipliers, item2Name)) {
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
        for(const [key, value] of Object.entries(damageMultipliers)) {
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

        document.getElementById('genderDifferencesText').textContent = '';

        maleImg.src = '';
        maleImg.style.display = 'none';
        maleImg.title = '';
        document.getElementById('maleIcon').style.display = 'none';

        femaleImg.src = '';
        femaleImg.style.display = 'none';
        femaleImg.title = '';
        document.getElementById('femaleIcon').style.display = 'none';

        if(data.sprites.front_female) {
            document.getElementById('genderDifferencesText').textContent = 'Gender differences:';

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
        document.getElementById('abilitiesText').textContent = 'Abilities:';
        for(const item of data.abilities) {
            newH2 = document.createElement('h2');
            if(item.is_hidden) {
                newH2.textContent = `  ${item.ability.name} (hidden)`;
            }
            else {
                newH2.textContent = `  ${item.ability.name}`;
            }
            newH2.classList.add('text', 'abilities');
            document.getElementById('abilities-container').appendChild(newH2);
        }

        const heightM = data.height / 10;
        const heightIn = Math.round(heightM * 39,3700787402);
        document.getElementById('height').textContent = `Height: ${heightM} m (${Math.floor(heightIn/12)}'${Math.round(heightIn%12)}")`;

        const weightKg = data.weight / 10;
        const weightLbs = Math.round(weightKg * 2.20462262185 * 10) / 10;
        document.getElementById('weight').textContent = `Weight: ${weightKg} kg (${weightLbs} lbs)`;

        /*
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        if(!evolutionResponse.ok) {
            throw new Error('Could not fetch evolution chain data');
        }
        const evolutionData = await evolutionResponse.json();

        document.getElementById('evolvesFromText').textContent = '';
        
        let evolutionChain = [];

        evolutionChain[0] = {
            name: evolutionData.chain.species.name,
        }
        if(evolutionData.chain.evolves_to.length !== 0) {
            evolutionChain[1] = [];
            for(const item of evolutionData.chain.evolves_to) {
                evolutionChain[1].push({
                    name: 
                })
            }
        }*/
    }
    catch(error) {
        console.error(error);
        document.getElementById('fetchText').textContent = 'Could not fetch data';
        const didYou = document.getElementById('didYou');
        if (didYou !== null) {didYou.remove();}
        document.querySelectorAll('.meanText').forEach(el => el.remove());
        let fetchTextContainer = document.getElementById('fetchText-container');
        let newP;
        switch(document.getElementById('pokemonInput').value.toLowerCase().replace(" ", "-")) {
            case 'shaymin':
                newP = document.createElement('p');
                newP.id = 'didYou';
                newP.textContent = 'did you mean?:';
                fetchTextContainer.appendChild(newP);

                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = 'shaymin-land';
                newP.textContent = 'shaymin-land';
                fetchTextContainer.appendChild(newP);
                newP.setAttribute('onclick', 'fetchNewInput(\'shaymin-land\'); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());');
            
                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = 'shaymin-sky';
                newP.textContent = 'shaymin-sky';
                fetchTextContainer.appendChild(newP);
                newP.setAttribute('onclick', 'fetchNewInput(\'shaymin-sky\'); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());');
                break;
            case 'nidoran':
                newP = document.createElement('p');
                newP.id = 'didYou';
                newP.textContent = 'did you mean?:';
                fetchTextContainer.appendChild(newP);

                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = 'nidoran-m';
                newP.textContent = 'nidoran-m';
                fetchTextContainer.appendChild(newP);
                newP.setAttribute('onclick', 'fetchNewInput(\'nidoran-m\'); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());');
            
                newP = document.createElement('p');
                newP.classList.add('meanText', 'clickable');
                newP.id = 'nidoran-f';
                newP.textContent = 'nidoran-f';
                fetchTextContainer.appendChild(newP);
                newP.setAttribute('onclick', 'fetchNewInput(\'nidoran-f\'); document.getElementById(\'didYou\').remove(); document.querySelectorAll(\'.meanText\').forEach(el => el.remove());');
                break;
            case 'pyroar':
                fetchNewInput('pyroar-male');
                break;
        }
    }
}

function fetchNewInput(text) {
    document.getElementById('pokemonInput').value = text;
    fetchData();
}

function switchTheme(theme) {
    themes = {
        dark: ['rgb(50, 50, 50)', 'rgb(255, 255, 255)', 'rgb(100, 100, 100)'],
        light: ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(200, 200, 200)'],
        pokedex: ['rgb(220, 10, 45)', 'rgb(0, 0, 0)', 'rgb(41, 170, 253)'],
        gameboy: ['rgb(155, 188, 15)', 'rgb(15, 56, 15)', 'rgb(139, 172, 15)']
    }

    document.getElementById('body').style['background-color'] = themes[theme][0];
    document.getElementById('body').style['color'] = themes[theme][1];

    document.getElementById('fetch-button').style['background-color'] = themes[theme][2];
    document.getElementById('fetch-button').style['color'] = themes[theme][1];
    document.getElementById('fetch-button').style['border-color'] = themes[theme][1];

    document.getElementById('pokemonInput').style['border-color'] = themes[theme][1];

    document.getElementById('themes-container').style['background'] = themes[theme][2];
    
    document.getElementById('themes-text').style['color'] = themes[theme][1];
    document.querySelectorAll('.theme').forEach(element => {
        element.style['color'] = themes[theme][1];
    });

    document.querySelectorAll('.pokemonImages').forEach(element => {
        element.style['background-color'] = themes[theme][2];
        element.style['border-color'] = themes[theme][1];
    });
}