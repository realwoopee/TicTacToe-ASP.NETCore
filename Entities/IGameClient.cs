using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TicTacToe.Entities
{
    public interface IGameClient
    {
        Task RecieveGameState(GameState gameState, Cell[,] grid);
        Task RecievePlayerStatus(PlayerStatus status);
        Task ReceiveMessage(string user, string message);
        Task ReceieveAuthRequest(string message);
    }
}
