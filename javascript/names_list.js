export async function getPokemonList() {
    let pokemonList = [];
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=100000&offset=0');
        if (!response.ok) {
            throw new Error('Could not fetch data');
        }
        const data = await response.json();

        for (const pokemon of data.results) {
            pokemonList.push(pokemon.name);
        }
    }
    catch (error) {
        console.error(error);
    }
    return pokemonList;
}

export async function getLocationsList() {
    let locationsList = [];
    try {
        const response = await fetch('https://pokeapi.co/api/v2/region/?limit=100000&offset=0');
        if(!response.ok) {
            throw new Error('Could not fetch data');
        }
        const data = await response.json();

        let urls = [];
        for(const item of data.results) {
            urls.push(item.url);
        }

        const responses = await Promise.all(urls.map(url => fetch(url)));
        const locationsData = await Promise.all(responses.map(res => res.json()));
        locationsList = locationsData.map(reg => reg.locations.map(loc => loc.name)).flat();
    }
    catch(error) {
        console.error(error);
    }
    return locationsList;
}

export async function getAreasList() {
    let areasList = [];
    try {
        const response = await fetch('https://pokeapi.co/api/v2/region/?limit=100000&offset=0');
        if(!response.ok) {
            throw new Error('Could not fetch data');
        }
        const data = await response.json();

        let urls = [];
        for(const item of data.results) {
            urls.push(item.url);
        }

        const locationsResponses = await Promise.all(urls.map(url => fetch(url)));
        const locationsData = await Promise.all(locationsResponses.map(res => res.json()));
        locationsList = locationsData.map(reg => reg.locations.map(loc => loc.url)).flat();
        
        const areasResponses = await Promise.all(locationsList.map(url => fetch(url)));
        const areasData = await Promise.all(areasResponses.map(res => res.json()));
        areasList = areasData.map(reg => reg.areas.map(loc => loc.name)).flat();
    }
    catch(error) {
        console.error(error);
    }
    return areasList;
}

export async function getRegionsList() {
    let regionsList = [];
    try {
        const response = await fetch('https://pokeapi.co/api/v2/region/?limit=100000&offset=0');
        if(!response.ok) {
            throw new Error('Could not fetch data');
        }
        const data = await response.json();

        for(const item of data.results) {
            regionsList.push(item.name);
        }
    }
    catch(error) {
        console.error(error);
    }
    return regionsList;
}

export async function getGamesList() {
    let gamesList = [];
    try {
        const versionGroupResponse = await fetch('https://pokeapi.co/api/v2/version-group/?limit=100000&offset=0');
        if (!versionGroupResponse.ok) {
            throw new Error('Could not fetch data');
        }
        const versionGroupData = await versionGroupResponse.json();

        for (const item of versionGroupData.results) {
            gamesList.push(item.name);
        }

        const versionResponse = await fetch('https://pokeapi.co/api/v2/version/?limit=100000&offset=0');
        if (!versionResponse.ok) {
            throw new Error('Could not fetch data');
        }
        const versionData = await versionResponse.json();

        for (const item of versionData.results) {
            gamesList.push(item.name);
        }
    }
    catch (error) {
        console.error(error);
    }
    return gamesList;
}

export async function getMovesList() {
    let movesList = [];
    try {
        const response = await fetch('https://pokeapi.co/api/v2/move/?limit=100000&offset=0');
        if(!response.ok) {
            throw new Error('Could not fetch data');
        }
        const data = await response.json();

        for(const item of data.results) {
            movesList.push(item.name);
        }
    }
    catch(error) {
        console.error(error);
    }
    return movesList;
}

// All code past this point was heavily assisted by the OpenAI chatbot ChatGPT

export async function get3ClosestNames(input, param = 'pokemon') {
    let namesList = [];
    switch(param) {
        case 'pokemon':
            namesList = await getPokemonList()
            break
        case 'locations':
            namesList = await getLocationsList()
            break
        case 'areas':
            namesList = await getAreasList()
            break
        case 'regions':
            namesList = await getRegionsList()
            break
        case 'games':
            namesList = await getGamesList()
            break
        case 'moves':
            namesList = await getMovesList()
            break
    }

    const top3ClosestNames = namesList
        .map(name => ({
            name,
            score: similarityScore(input, name)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.name);

    return top3ClosestNames;
}

export function levenshtein(a, b) {
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

export function similarityScore(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();

    let score = -levenshtein(a, b);

    if(a === b) {
        score += 2000;
    }
    if (a.includes(b) || b.includes(a)) {
        score += 1000;
    }

    return score;
}