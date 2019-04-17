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

        /* отправляет клиенту информацию об игре: её состояние и доп. инфу в зависимости от состояния */
        public async Task GetState()
        {
            await Clients.Caller.RecieveGameState(_service.GameState, _service.Grid);
            if(_service.Users.GetByID(Context.ConnectionId) != null)
                await Clients.Caller.RecievePlayerStatus(_service.Users.GetByID(Context.ConnectionId).Status);
        }

        public async Task DoMove(Move move)
        {
            var userId = Context.ConnectionId;
            try
            {
                _service.RecieveMove(move, userId);

                await Clients.All.RecieveGameState(_service.GameState, _service.Grid);
            }
            catch(Exception e)
            {
                throw new HubException(e.Message);
            }
        }

        public async Task SendMessage(string message)
        {
            await Clients.All.ReceiveMessage(
                _service.Users.GetByID(Context.ConnectionId)?.Name,
                message);
        }
        
        public async Task Auth(string userName, PlayerStatus status)
        {
            try
            {
                _service.AuthUser(Context.ConnectionId, userName, status);
                await Clients.Caller.RecievePlayerStatus(status);
                await Clients.All.RecieveGameState(_service.GameState, _service.Grid);
            }
            catch (Exception e)
            {
                await Clients.Caller.ReceieveAuthRequest(e.Message);
            }
        }

        public async Task Restart()
        {
            _service.Restart(Context.ConnectionId);
            await Clients.All.RecieveGameState(_service.GameState, _service.Grid);
        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            _service.DeauthUser(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
