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

connection
  .start()
  .catch(err => document.write(err))
  .then(() => drawGrid());

const gridColor = '#000000';
const xColor = '#000088';
const oColor = '#880000';
const bgColor = '#FFFFFF';
const cellSize = 105;

function drawGrid(){
  let ctx = canv.getContext("2d");
  let bar = new Path2D();

  bar.rect(0,100,315,5);
  bar.rect(0,205,315,5);

  bar.rect(100,0,5,315);
  bar.rect(205,0,5,315);

  ctx.fillStyle = gridColor;
  ctx.fill(bar);
}

function drawX(xPos: number, yPos: number){
  let ctx = canv.getContext("2d");
  let cross = new Path2D();

  cross.moveTo(xPos*cellSize + 15,yPos*cellSize + 15);
  cross.lineTo(xPos*cellSize + 85,yPos*cellSize + 85);

  cross.moveTo(xPos*cellSize + 15,yPos*cellSize + 85);
  cross.lineTo(xPos*cellSize + 85,yPos*cellSize + 15);

  ctx.strokeStyle = xColor;
  ctx.stroke(cross);
  ctx.stroke(cross);
}

function drawO(xPos: number, yPos: number){
  let ctx = canv.getContext("2d");
  let circle = new Path2D();

  circle.arc(xPos*cellSize + 50,yPos*cellSize + 50,
    35, 0, 2 * Math.PI);

  ctx.strokeStyle = oColor;
  ctx.stroke(circle);
  ctx.stroke(circle);
}

function drawEmtpy(xPos: number, yPos: number){
  let ctx = canv.getContext("2d");

  ctx.fillStyle = bgColor;
  ctx.fillRect(xPos*cellSize,yPos*cellSize,100,100);
}

function onGameRestart(){
  for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
          drawEmtpy(x,y);
      }
  }
}

connection.on("RecieveGameState", (gameState: GameState, grid: Cell[][]) => {
    if(gameState == GameState.Preparing)
    {
      onGameRestart();
      return;
    }
    
    for(let x = 0; x < grid.length; x++)
    {
      for(let y = 0; y < grid[x].length; y++)
      {
        drawEmtpy(x,y);
        if(grid[x][y] == Cell.X)
        {
          drawX(x,y);
        }
        if(grid[x][y] == Cell.O)
        {
          drawO(x,y);
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
