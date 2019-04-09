import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "@fortawesome/fontawesome-free/css/all.min.css";


import * as signalR from "@aspnet/signalr";

const canv: HTMLCanvasElement = document.querySelector("#cvGame");
const chatMessageBox: HTMLInputElement =
  document.querySelector("#chatMessageBox");
const chatMessageBtn: HTMLButtonElement =
  document.querySelector("#chatMessageBtn");
const chatMessages: HTMLDListElement =
  document.querySelector("#chatMessages");

const authName: HTMLInputElement =
  document.querySelector("#authName");
const authState: HTMLSelectElement =
    document.querySelector("#authState");
const authBtn: HTMLButtonElement =
      document.querySelector("#authBtn");

const gameStateText: HTMLHeadingElement =
  document.querySelector("#gameStateText");
const btnRestart: HTMLButtonElement =
  document.querySelector("#btnRestart");
const playerStatusText: HTMLHeadingElement =
  document.querySelector("#playerStatusText");

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();

enum Cell {
    Empty,
    X,
    O,
}

const numToGSdict: {[n:number]:string} ={
  0 : "Preparing",
  1 : "X's turn",
  2 : "O's turn",
  3 : "X won",
  4 : "O won",
  5 : "Draw"
}

const strToState: {[n:string]:number} ={
  "X" : 1,
  "O" : 2,
  "Spectator" : 0
}

const statusToStr: {[n:number]:string} ={
  0: "Spectator",
  1: "Playing as X",
  2: "Playing as O"
}

connection
  .start()
  .catch(err => document.write(err))
  .then(() => drawGrid())
  .then(() => requestGamestate());

let isPlaying = false;

authBtn.onclick = () => {
  connection.invoke("Auth", authName.value, strToState[authState.value]);
};

btnRestart.onclick = () => {
  connection.invoke("Restart");
};

chatMessageBtn.onclick = () => sendMessage();

canv.onmousemove = (event)=> {
  if(!isPlaying){
    return;
  }

  var x = event.pageX - canv.getBoundingClientRect().left,
      y = event.pageY - canv.getBoundingClientRect().top;
  x = Math.floor(x/cellSize);
  y = Math.floor(y/cellSize);

  drawBoard();

  drawEmpty(x,y,bgHoverColor);
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


canv.onmousedown = (event)=> {
  if(!isPlaying){
    return;
  }
  var x = event.pageX - canv.getBoundingClientRect().left,
      y = event.pageY - canv.getBoundingClientRect().top;
  x = Math.floor(x/cellSize);
  y = Math.floor(y/cellSize);

  sendMove(x,y);

  drawEmpty(x,y,bgClickColor);
  if(grid[x][y] == Cell.X)
  {
    drawX(x,y);
  }
  if(grid[x][y] == Cell.O)
  {
    drawO(x,y);
  }
};

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

function drawEmpty(xPos: number, yPos: number, color: string){
  let ctx = canv.getContext("2d");

  ctx.fillStyle = color;
  ctx.fillRect(xPos*cellSize,yPos*cellSize,100,100);
}

function onGameRestart(){
  for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
          drawEmpty(x,y,bgColor);
      }
  }
}

function drawBoard(){
  for(let x = 0; x < grid.length; x++)
  {
    for(let y = 0; y < grid[x].length; y++)
    {
      drawEmpty(x,y,bgColor);
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

function sendMessage(){
  //проверка на то, что сообщение пустое
  if(chatMessageBox.value === null || (/^\s*$/).test(chatMessageBox.value))
  {
      return;
  }

  connection.invoke("SendMessage", chatMessageBox.value)
      .catch(err => console.error(err))
      .then(() => chatMessageBox.value = "");
}

function sendMove(x: number, y: number) {
    connection.invoke("DoMove", { X: x, Y: y })
      .catch(err => console.error(err))
      .then(() => requestGamestate());
}

function requestGamestate() {
    connection.invoke("GetState")
      .catch(err => console.error(err));
}

connection.on("RecieveGameState", (gameState: number, cells: Cell[][]) => {
    gameStateText.innerText = numToGSdict[gameState];

    btnRestart.disabled = true;

    if(gameState == 0) //Preparing
    {
      onGameRestart();
    }

    if(gameState == 5 || gameState == 3 || gameState == 4)
    {
      btnRestart.disabled = false;
    }

    grid = cells;

    drawBoard();
});

connection.on("ReceiveMessage", (username: string, message: string) => {
  let userName = document.createElement("dt");
  let messageEl = document.createElement("dd");

  userName.innerText = username;
  messageEl.innerText = message;

  chatMessages.appendChild(userName);
  chatMessages.appendChild(messageEl);
  chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
});


connection.on("ReceieveAuthRequest", (message: string) => {
  isPlaying = false;
  authBtn.disabled = false;
  chatMessageBtn.disabled = true;
  playerStatusText.innerText = "You aren't authorized";
});

connection.on("RecievePlayerStatus", (playerstatus: number) => {
  isPlaying = true;
  chatMessageBtn.disabled = false;
  authBtn.disabled = true;
  playerStatusText.innerText = "You are " + statusToStr[playerstatus];
});
