import { themes } from "./misc.js";
import { state } from "./state.js";

window.createGrid = createGrid;
window.playLife = playLife;
window.nextLife = nextLife;
window.stopLife = stopLife;

let lifeTimer = null;

export function createGrid() {
    if(lifeTimer !== null) stopLife();
    document.querySelectorAll(".grid").forEach(el => el.remove());
    let lenValue = document.getElementById("lenInput").value;
    globalThis.len = 50;
    if(lenValue) {
        len = Number(lenValue);
        if(Number.isNaN(len)) {
            len = 50;
        }
    }
    params.set('length', len);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    const lifeContainer = document.getElementById("life-container");
    let cellrow, cell, theme;
    for(let i = 0; i < len; i++) {
        cellrow = document.createElement("div");
        cellrow.style.display = "flex";
        cellrow.classList.add("grid");
        lifeContainer.appendChild(cellrow);
        for(let j = 0; j < len; j++) {
            cell = document.createElement("div");
            cell.id = `${j}, ${i}`;
            cell.classList.add("cell", "grid");
            theme = state.usingTheme;
            cell.style = `height: 15px; width: 15px; margin: 1px; background-color: ${themes[theme][0]}; border-radius: 8px;`;
            cell.onclick = () => {
                theme = state.usingTheme;
                cell = document.getElementById(`${j}, ${i}`);
                switch(cell.style["background-color"]) {
                    case themes[theme][0]:
                        cell.style["background-color"] = themes[theme][1];
                        break;
                    case themes[theme][1]:
                        cell.style["background-color"] = themes[theme][0];
                        break;
                }
            }
            cellrow.appendChild(cell);
        }
    }
    lifeContainer.style.display = "block";
    document.getElementById("timeInput").style.display = "inline-block";
    document.getElementById("playBtn").style.display = "inline-block";
    document.getElementById("nextBtn").style.display = "inline-block";
    document.getElementById("stopBtn").style.display = "inline-block";
}

function getNeighborCount(x, y) {
    let count = 0;

    if(x != 0) {
        if(isAlive(x-1, y)) {
            count++;
        }
        if(y != 0) {
            if(isAlive(x-1, y-1)) {
                count++;
            }
        }
        if(y != len - 1) {
            if(isAlive(x-1, y+1)) {
                count++;
            }
        }
    }
    if(x != len - 1) {
        if(isAlive(x+1, y)) {
            count++;
        }
        if(y != 0) {
            if(isAlive(x+1, y-1)) {
                count++;
            }
        }
        if(y != len - 1) {
            if(isAlive(x+1, y+1)) {
                count++;
            }
        }
    }
    if(y != 0) {
        if(isAlive(x, y-1)) {
            count++;
        }
    }
    if(y != len - 1) {
        if(isAlive(x, y+1)) {
            count++;
        }
    }

    return count;
}

function isAlive(x, y) {
    let theme = state.usingTheme;
    return document.getElementById(`${x}, ${y}`).style["background-color"] == themes[theme][1];
}

function nextLife(build = false) {
    let life = document.getElementById("life-container");
    let lifeClone = life.cloneNode(true);
    let spaceIndex, x, y, neighborCount;
    let theme = state.usingTheme;
    let allDead = true;
    for(const cellrow of lifeClone.children) {
        for(const cell of cellrow.children) {
            const [x, y] = cell.id.split(", ").map(Number);
            
            neighborCount = getNeighborCount(x, y);
            if(isAlive(x, y)) {
                allDead = false;
                if(neighborCount < 2 || neighborCount > 3) {
                    cell.style["background-color"] = themes[theme][0];
                }
            } else {
                if(neighborCount === 3) {
                    cell.style["background-color"] = themes[theme][1];
                }
            }
        }
    }
    if(life === lifeClone) stopLife();
    else {
        life.replaceWith(lifeClone);
        if(build) {
            let cell, theme;
            for(let i = 0; i < len; i++) {
                for(let j = 0; j < len; j++) {
                    cell = document.getElementById(`${j}, ${i}`);
                    cell.onclick = () => {
                        theme = state.usingTheme;
                        cell = document.getElementById(`${j}, ${i}`);
                        switch(cell.style["background-color"]) {
                            case themes[theme][0]:
                                cell.style["background-color"] = themes[theme][1];
                                break;
                            case themes[theme][1]:
                                cell.style["background-color"] = themes[theme][0];
                                break;
                        }
                    }
                }
            }
        }
    }
}

export function newLenInput(text) {
    document.getElementById('lenInput').value = text;
    createGrid();
}

function playLife() {
    if(lifeTimer !== null) return;
    runLife();
}

function runLife() {
    nextLife();
    let timeValue = document.getElementById("timeInput").value;
    let time = 250;
    if(timeValue) {
        time = Number(timeValue);
        if(Number.isNaN(time)) {
            time = 250;
        }
    }
    lifeTimer = setTimeout(runLife, time);
}

function stopLife() {
    clearTimeout(lifeTimer);
    lifeTimer = null;

    let cell, theme;
    for(let i = 0; i < len; i++) {
        for(let j = 0; j < len; j++) {
            cell = document.getElementById(`${j}, ${i}`);
            cell.onclick = () => {
                theme = state.usingTheme;
                cell = document.getElementById(`${j}, ${i}`);
                switch(cell.style["background-color"]) {
                    case themes[theme][0]:
                        cell.style["background-color"] = themes[theme][1];
                        break;
                    case themes[theme][1]:
                        cell.style["background-color"] = themes[theme][0];
                        break;
                }
            }
        }
    }
}