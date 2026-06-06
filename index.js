
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
            baseStatTotal = baseStatTotal + item.base_stat;
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
        document.getElementById('shiny-sparkles').style.display = 'block'

        document.getElementById('baseStatTotal').textContent = `Base stat total: ${baseStatTotal}`;
    }
    catch(error) {
        console.error(error);
        document.getElementById('fetchText').textContent = 'Could not fetch data';
    }
}