"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("bootstrap");
require("bootstrap/dist/css/bootstrap.min.css");
require("@fortawesome/fontawesome-free/css/all.min.css");
var signalR = require("@aspnet/signalr");
var canv = document.querySelector("#cvGame");
var chatMessageBox = document.querySelector("#chatMessageBox");
var chatMessageBtn = document.querySelector("#chatMessageBtn");
var chatMessages = document.querySelector("#chatMessages");
var authName = document.querySelector("#authName");
var authState = document.querySelector("#authState");
var authBtn = document.querySelector("#authBtn");
var gameStateText = document.querySelector("#gameStateText");
var btnRestart = document.querySelector("#btnRestart");
var playerStatusText = document.querySelector("#playerStatusText");
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();
var Cell;
(function (Cell) {
    Cell[Cell["Empty"] = 0] = "Empty";
    Cell[Cell["X"] = 1] = "X";
    Cell[Cell["O"] = 2] = "O";
})(Cell || (Cell = {}));
var numToGSdict = {
    0: "Preparing",
    1: "X's turn",
    2: "O's turn",
    3: "X won",
    4: "O won",
    5: "Draw"
};
var strToState = {
    "X": 1,
    "O": 2,
    "Spectator": 0
};
var statusToStr = {
    0: "Spectator",
    1: "Playing as X",
    2: "Playing as O"
};
connection
    .start()
    .catch(function (err) { return document.write(err); })
    .then(function () { return drawGrid(); })
    .then(function () { return requestGamestate(); });
var isPlaying = false;
authBtn.onclick = function () {
    connection.invoke("Auth", authName.value, strToState[authState.value])
        .then(function () {
        chatMessageBtn.disabled = false;
        authBtn.disabled = true;
    });
};
btnRestart.onclick = function () {
    connection.invoke("Restart");
};
chatMessageBtn.onclick = function () { return sendMessage(); };
canv.onmousemove = function (event) {
    if (!isPlaying) {
        return;
    }
    var x = event.pageX - canv.getBoundingClientRect().left, y = event.pageY - canv.getBoundingClientRect().top;
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);
    drawBoard();
    drawEmpty(x, y, bgHoverColor);
    if (grid[x][y] == Cell.X) {
        drawX(x, y);
    }
    if (grid[x][y] == Cell.O) {
        drawO(x, y);
    }
};
canv.onmouseleave = function () { return drawBoard(); };
canv.onmousedown = function (event) {
    if (!isPlaying) {
        return;
    }
    var x = event.pageX - canv.getBoundingClientRect().left, y = event.pageY - canv.getBoundingClientRect().top;
    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);
    sendMove(x, y);
    drawEmpty(x, y, bgClickColor);
    if (grid[x][y] == Cell.X) {
        drawX(x, y);
    }
    if (grid[x][y] == Cell.O) {
        drawO(x, y);
    }
};
var grid = [];
var gridColor = '#000000', xColor = '#000088', oColor = '#880000', bgColor = '#FFFFFF', bgHoverColor = '#f0f0f0', bgClickColor = '#505050', cellSize = 105;
function drawGrid() {
    var ctx = canv.getContext("2d");
    var bar = new Path2D();
    bar.rect(0, 100, 310, 5);
    bar.rect(0, 205, 310, 5);
    bar.rect(100, 0, 5, 310);
    bar.rect(205, 0, 5, 310);
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
function drawEmpty(xPos, yPos, color) {
    var ctx = canv.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(xPos * cellSize, yPos * cellSize, 100, 100);
}
function onGameRestart() {
    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            drawEmpty(x, y, bgColor);
        }
    }
}
function drawBoard() {
    for (var x = 0; x < grid.length; x++) {
        for (var y = 0; y < grid[x].length; y++) {
            drawEmpty(x, y, bgColor);
            if (grid[x][y] == Cell.X) {
                drawX(x, y);
            }
            if (grid[x][y] == Cell.O) {
                drawO(x, y);
            }
        }
    }
}
function sendMessage() {
    //проверка на то, что сообщение пустое
    if (chatMessageBox.value === null || (/^\s*$/).test(chatMessageBox.value)) {
        return;
    }
    connection.invoke("SendMessage", chatMessageBox.value)
        .catch(function (err) { return console.error(err); })
        .then(function () { return chatMessageBox.value = ""; });
}
function sendMove(x, y) {
    connection.invoke("DoMove", { X: x, Y: y })
        .catch(function (err) { return console.error(err); })
        .then(function () { return requestGamestate(); });
}
function requestGamestate() {
    connection.invoke("GetState")
        .catch(function (err) { return console.error(err); });
}
connection.on("RecieveGameState", function (gameState, cells) {
    gameStateText.innerText = numToGSdict[gameState];
    btnRestart.disabled = true;
    if (gameState == 0) //Preparing
     {
        onGameRestart();
        return;
    }
    if (gameState == 5 || gameState == 3 || gameState == 4) {
        btnRestart.disabled = false;
        return;
    }
    grid = cells;
    drawBoard();
});
connection.on("ReceiveMessage", function (username, message) {
    var userName = document.createElement("dt");
    var messageEl = document.createElement("dd");
    userName.innerText = username;
    messageEl.innerText = message;
    chatMessages.appendChild(userName);
    chatMessages.appendChild(messageEl);
    chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
});
connection.on("ReceieveAuthRequest", function (message) {
    isPlaying = false;
    playerStatusText.innerText = "You aren't authorized";
});
connection.on("RecievePlayerStatus", function (playerstatus) {
    isPlaying = true;
    playerStatusText.innerText = "You are " + statusToStr[playerstatus];
});
