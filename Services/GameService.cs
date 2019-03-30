using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicTacToe.Entities;

namespace TicTacToe.Services
{
    public class GameService
    {
        public GameState GameState { get; set; }

        public Cell[,] Grid { get; set; }

        public GameService()
        {
            GameState = GameState.PlayerXTurn;
            Grid = new Cell[3, 3];
        }

        public (GameState, Cell[,]) GetState()
        {
            return (GameState, Grid);
        }

        public async Task<(Result, GameState, Cell[,])> RecieveMove(Move move)
        {
            if(ProcessMove(move) == Result.Successful)
            {
                var gmstate = ProcessGrid();

                if (gmstate == (GameState.XWin | GameState.OWin))
                {
                    if (GameState == GameState.PlayerXTurn)
                    {
                        GameState = GameState.PlayerOTurn;
                        return (Result.Successful, GameState, Grid);
                    }

                    if (GameState == GameState.PlayerOTurn)
                    {
                        GameState = GameState.PlayerXTurn;
                        return (Result.Successful, GameState, Grid);
                    }
                }
                else //Если кто-то выиграл
                {
                    GameState = gmstate;
                    return (Result.Successful, GameState, Grid);
                }
                //до этой точки доходить никогда не должно
                return (Result.Failed, GameState, Grid);
            }
            else
            {
                return (Result.Failed, GameState, Grid);
            }
        }

        private Result ProcessMove(Move move)
        {
            switch (GameState)
            {
                case GameState.PlayerXTurn:
                    if (Grid[move.X, move.Y] == Cell.Empty)
                    {
                        Grid[move.X, move.Y] = Cell.X;
                        return Result.Successful;
                    }
                    else
                    {
                        return Result.Failed;
                    }
                case GameState.PlayerOTurn:
                    if (Grid[move.X, move.Y] == Cell.Empty)
                    {
                        Grid[move.X, move.Y] = Cell.O;
                        return Result.Successful;
                    }
                    else
                    {
                        return Result.Failed;
                    }
                default:
                    return Result.Failed;
            }
        }

        private GameState ProcessGrid()
        {
            for (int y = 0; y < 3; y++)
            {
                if(Grid[0, y] == Grid[1, y] && Grid[1, y] == Grid[2, y])
                    switch (Grid[0, y])
                    {
                        case Cell.X:
                            return GameState.XWin;
                        case Cell.O:
                            return GameState.OWin;
                    }
            }

            for (int x = 0; x < 3; x++)
            {
                if (Grid[x, 0] == Grid[x, 1] && Grid[x, 1] == Grid[x, 2])
                    switch (Grid[x, 0])
                    {
                        case Cell.X:
                            return GameState.XWin;
                        case Cell.O:
                            return GameState.OWin;
                    }
            }

            if (Grid[0, 0] == Grid[1, 1] && Grid[1, 1] == Grid[2, 2])
                switch (Grid[0, 0])
                {
                    case Cell.X:
                        return GameState.XWin;
                    case Cell.O:
                        return GameState.OWin;
                }

            if (Grid[2, 0] == Grid[1, 1] && Grid[1, 1] == Grid[0, 2])
                switch (Grid[2, 0])
                {
                    case Cell.X:
                        return GameState.XWin;
                    case Cell.O:
                        return GameState.OWin;
                }

            return GameState.XWin | GameState.OWin;
        }
    }
}