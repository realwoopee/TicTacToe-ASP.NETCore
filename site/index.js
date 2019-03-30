"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var signalR = require("@aspnet/signalr");
var canv = document.querySelector("#cvGame");
var username = new Date().getTime();
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();
var Cell;
(function (Cell) {
    Cell[Cell["Empty"] = 0] = "Empty";
    Cell[Cell["X"] = 1] = "X";
    Cell[Cell["O"] = 2] = "O";
})(Cell || (Cell = {}));
var GameState;
(function (GameState) {
    GameState[GameState["Preparing"] = 0] = "Preparing";
    GameState[GameState["PlayerXTurn"] = 1] = "PlayerXTurn";
    GameState[GameState["PlayerOTurn"] = 2] = "PlayerOTurn";
    GameState[GameState["XWin"] = 3] = "XWin";
    GameState[GameState["OWin"] = 4] = "OWin";
    GameState[GameState["Draw"] = 5] = "Draw";
})(GameState || (GameState = {}));
connection
    .start()
    .catch(function (err) { return document.write(err); })
    .then(function () { return drawGrid(); });
var gridColor = '#000000';
var xColor = '#000088';
var oColor = '#880000';
var bgColor = '#FFFFFF';
var cellSize = 105;
function drawGrid() {
    var ctx = canv.getContext("2d");
    var bar = new Path2D();
    bar.rect(0, 100, 315, 5);
    bar.rect(0, 205, 315, 5);
    bar.rect(100, 0, 5, 315);
    bar.rect(205, 0, 5, 315);
    ctx.fillStyle = gridColor;
    ctx.fill(bar);
}
function drawX(xPos, yPos) {
    var ctx = canv.getContext("2d");
    var cross = new Path2D();
    cross.moveTo(xPos * cellSize + 15, yPos * cellSize + 15);
    cross.lineTo(xPos * cellSize + 85, yPos * cellSize + 85);
    cross.moveTo(xPos * cellSize + 15, yPos * cellSize + 85);
    cross.lineTo(xPos * cellSize + 85, yPos * cellSize + 15);
    ctx.strokeStyle = xColor;
    ctx.stroke(cross);
    ctx.stroke(cross);
}
function drawO(xPos, yPos) {
    var ctx = canv.getContext("2d");
    var circle = new Path2D();
    circle.arc(xPos * cellSize + 50, yPos * cellSize + 50, 35, 0, 2 * Math.PI);
    ctx.strokeStyle = oColor;
    ctx.stroke(circle);
    ctx.stroke(circle);
}
function drawEmtpy(xPos, yPos) {
    var ctx = canv.getContext("2d");
    ctx.fillStyle = bgColor;
    ctx.fillRect(xPos * cellSize, yPos * cellSize, 100, 100);
}
function onGameRestart() {
    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            drawEmtpy(x, y);
        }
    }
}
connection.on("RecieveGameState", function (gameState, grid) {
    if (gameState == GameState.Preparing) {
        onGameRestart();
        return;
    }
    for (var x = 0; x < grid.length; x++) {
        for (var y = 0; y < grid[x].length; y++) {
            drawEmtpy(x, y);
            if (grid[x][y] == Cell.X) {
                drawX(x, y);
            }
            if (grid[x][y] == Cell.O) {
                drawO(x, y);
            }
        }
    }
});
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
