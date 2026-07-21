import { state } from './state.js';

export const themes = {
    dark: ['rgb(40, 40, 40)', 'rgb(170, 170, 170)', 'rgb(80, 80, 80)'],
    light: ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(200, 200, 200)'],
    pokedex: ['rgb(220, 10, 45)', 'rgb(0, 0, 0)', 'rgb(41, 170, 253)'],
    gameboy: ['rgb(155, 188, 15)', 'rgb(15, 56, 15)', 'rgb(139, 172, 15)'],
    ultraball: ['rgb(40, 40, 40)', 'rgb(253, 209, 60)', 'rgb(30, 30, 30)'],
    premier: ['rgb(255, 255, 255)', 'rgb(220, 10, 45)', 'rgb(255, 255, 255)'],
    black: ['rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(40, 40, 40)']
}

export function encounterCounter(param, value = null) {
    const encounterTally = document.getElementById('encounterTally');
    let count = Number(encounterTally.textContent);
    let ok = true;
    switch(param) {
        case 'plus':
            count++;
            break;
        case 'minus':
            count--;
            break;
        case 'reset':
            count = 0;
            break;
        case 'add':
            count += Number(value);
            if(Number.isNaN(count)) {
                ok = false;
            }
            break;
        case 'sub':
            count -= Number(value);
            if(Number.isNaN(count)) {
                ok = false;
            }
            break;
        case 'set':
            count = Number(value);
            if(Number.isNaN(count)) {
                ok = false;
            }
            document.getElementById('setInput').value = '';
            break;
    }
    if(ok) {
        encounterTally.textContent = count;
        params.set('count', count);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        localStorage.setItem('count', count);
    }
}

export function switchTheme(theme) {
    const oldTheme = state.usingTheme;
    state.usingTheme = theme;

    params.set('theme', theme);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    localStorage.setItem('theme', theme);

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

    if(page === "index") {
        const indexBody = document.getElementById('index-body');
        indexBody.style['background-color'] = themes[theme][0];
        indexBody.style['color'] = themes[theme][1];
    }
    else if(page === "locations") {
        const locationsBody = document.getElementById('locationsBody');
        locationsBody.style['background-color'] = themes[theme][0];
        locationsBody.style['color'] = themes[theme][1];
    }
    else if(page === "shinytools") {
        const shinytoolsBody = document.getElementById('shinytoolsBody');
        shinytoolsBody.style['background-color'] = themes[theme][0];
        shinytoolsBody.style['color'] = themes[theme][1];
    }
    else if(page === "moves") {
        const movesBody = document.getElementById('movesBody');
        movesBody.style['background-color'] = themes[theme][0];
        movesBody.style['color'] = themes[theme][1];
    }
    else {
        const body = document.getElementById('body');
        body.style['background-color'] = themes[theme][0];
        body.style['color'] = themes[theme][1];

        const lifeContainer = document.getElementById('life-container');
        lifeContainer.style['background-color'] = themes[theme][2];
        lifeContainer.style['border-color'] = themes[theme][1];

        let isAlive;
        document.querySelectorAll('.cell').forEach(el => {
            isAlive = el.style["background-color"] == themes[oldTheme][1];
            switch(isAlive) {
                case true:
                    el.style['background-color'] = themes[theme][1];
                    break;
                case false:
                    el.style['background-color'] = themes[theme][0];
                    break;
            }
        });
    }

    document.querySelectorAll('.textInput').forEach(el => el.style['border-color'] = themes[theme][1]);

    document.querySelectorAll('.button').forEach(el => {
        el.style['background-color'] = themes[theme][2];
        el.style['color'] = themes[theme][1];
        el.style['border-color'] = themes[theme][1];
    });

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