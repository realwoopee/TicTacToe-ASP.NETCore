import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "@fortawesome/fontawesome-free/css/all.min.css";


import * as signalR from "@aspnet/signalr";

const canv: HTMLCanvasElement = document.querySelector("#cvGame");
const username = new Date().getTime();

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();

enum Cell {
    Empty,
    X,
    O,
}

enum GameState {
    Preparing,
    PlayerXTurn,
    PlayerOTurn,
    XWin,
    OWin,
    Draw
}

connection.start().catch(err => document.write(err));
/*
connection.on("ReceiveMessage", (username: string, message: string) => {
    let m = document.createElement("div");

    m.innerHTML =
        `<div class="message-author">${username}</div><div>${message}</div>`;

    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});

connection.on("RecieveGameState", (gameState: GameState, grid: Cell[][]) => {
    let m = document.createElement("div");

    m.innerHTML =
        `<div class="message-author">${username}</div><div>${GameState[gameState]} + ${grid.map((v: Cell[], index: number, array: Cell[][]) => v.map((c: Cell, index: number, array: Cell[]) => c == Cell.Empty ? " " : Cell[c]))}</div>`;

    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});

btnSend.addEventListener("click", send);

function send() {
    connection.send("DoMove", { X: tbX.valueAsNumber, Y: tbY.valueAsNumber })
        .catch(err => document.write(err))
        .then(() => tbX.value = "")
        .then(() => tbY.value = "");
}*/
