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
  .then(() => drawGrid())
  .then(() => requestGamestate())
  .then(() => sendMove(0,0))
  .then(() => sendMove(1,0))
  .then(() => sendMove(1,1))
  .then(() => sendMove(2,2))
  .then(() => sendMove(2,0));

canv.onmousemove = (event)=>{
  var x = event.pageX - canv.getBoundingClientRect().left,
      y = event.pageY - canv.getBoundingClientRect().top;
  x = Math.floor(x/cellSize);
  y = Math.floor(y/cellSize);

  drawBoard();

  drawEmtpy(x,y,bgHoverColor);
  if(grid[x][y] == Cell.X)
  {
    drawX(x,y);
  }
  if(grid[x][y] == Cell.O)
  {
    drawO(x,y);
  }
};

canv.onmouseleave = () => drawBoard();


let grid: Cell[][] = [];

const gridColor = '#000000',
 xColor = '#000088',
 oColor = '#880000',
 bgColor = '#FFFFFF',
 bgHoverColor = '#f0f0f0',
 bgClickColor = '#505050',
 cellSize = 105;

function drawGrid(){
  let ctx = canv.getContext("2d");
  let bar = new Path2D();

  bar.rect(0,100,310,5);
  bar.rect(0,205,310,5);

  bar.rect(100,0,5,310);
  bar.rect(205,0,5,310);

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

function drawEmtpy(xPos: number, yPos: number, color: string){
  let ctx = canv.getContext("2d");

  ctx.fillStyle = color;
  ctx.fillRect(xPos*cellSize,yPos*cellSize,100,100);
}

function onGameRestart(){
  for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
          drawEmtpy(x,y,bgColor);
      }
  }
}

function drawBoard(){
  for(let x = 0; x < grid.length; x++)
  {
    for(let y = 0; y < grid[x].length; y++)
    {
      drawEmtpy(x,y,bgColor);
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
}

connection.on("RecieveGameState", (gameState: GameState, cells: Cell[][]) => {
    if(gameState == GameState.Preparing)
    {
      onGameRestart();
      return;
    }
    grid = cells;

    drawBoard();
});

function sendMove(x,y) {
    connection.send("DoMove", { X: x, Y: y })
        .catch(err => document.write(err))
}

function requestGamestate() {
    connection.send("GetState")
        .catch(err => document.write(err))
}

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

*/
