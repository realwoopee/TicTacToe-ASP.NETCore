"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var signalR = require("@aspnet/signalr");
var divMessages = document.querySelector("#divMessages");
var tbX = document.querySelector("#tbX");
var tbY = document.querySelector("#tbY");
var btnSend = document.querySelector("#btnSend");
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
connection.start().catch(function (err) { return document.write(err); });
connection.on("ReceiveMessage", function (username, message) {
    var m = document.createElement("div");
    m.innerHTML =
        "<div class=\"message-author\">" + username + "</div><div>" + message + "</div>";
    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});
connection.on("RecieveGameState", function (gameState, grid) {
    var m = document.createElement("div");
    m.innerHTML =
        "<div class=\"message-author\">" + username + "</div><div>" + GameState[gameState] + " + " + grid.map(function (v, index, array) { return v.map(function (c, index, array) { return c == Cell.Empty ? " " : Cell[c]; }); }) + "</div>";
    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});
btnSend.addEventListener("click", send);
function send() {
    connection.send("DoMove", { X: tbX.valueAsNumber, Y: tbY.valueAsNumber })
        .catch(function (err) { return document.write(err); })
        .then(function () { return tbX.value = ""; })
        .then(function () { return tbY.value = ""; });
}
