using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using TicTacToe.Entities;
using TicTacToe.Services;

namespace TicTacToe.Hubs
{
    public class GameHub : Hub<IGameClient>
    {
        private GameService _service;

        public GameHub(GameService gameService)
        {
            _service = gameService;
            
        }

        public async Task GetState(/* отправляет клиенту информацию об игре: её состояние и доп. инфу в зависимости от состояния */)
        {
            await Clients.All.RecieveGameState(_service.GameState, _service.Grid);
        }

        public async Task DoMove(Move move)
        {
            
            (var result, var gamestate, var grid) = await _service.RecieveMove(move);
            if(result == Result.Successful)
            {
                await Clients.All.RecieveGameState(gamestate, grid);
            }
            else if(result == Result.Failed)
            {
                throw new Exception("Invalid move.");
            }
            else if (result == Result.Exception)
            {
                throw new Exception("There was an exception during verifying the move.");
            }
        }

        public async Task SendMessage(string message)
        {
            await Clients.All.ReceiveMessage(Context.ConnectionId, message);
        }
        
        public async Task SetPlayerStatus(PlayerStatus status)
        {

        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            return base.OnDisconnectedAsync(exception);
        }
    }
}
