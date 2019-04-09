using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicTacToe.DAL;
using TicTacToe.Entities;

namespace TicTacToe.Services
{
    public class GameService
    {
        public GameState GameState { get; set; }

        public Cell[,] Grid { get; set; }

        public UserDao Users { get; set; }

        public GameService()
        {
            Users = new UserDao();
            GameState = GameState.Preparing;
            Grid = new Cell[3, 3];
        }

        public (GameState, Cell[,]) GetState()
        {
            return (GameState, Grid);
        }

        public void AuthUser(
            string userId, 
            string userName, 
            PlayerStatus status)
        {
            switch (status)
            {
                case PlayerStatus.PlayerX:
                    {
                        if (Users.PlayerX == null)
                        {
                            var user = new User
                            {
                                ID = userId,
                                Name = userName,
                                Status = PlayerStatus.PlayerX
                            };

                            Users.Add(user);
                        }
                        else
                        {
                            throw new Exception("There is already a PlayerX");
                        }
                        break;
                    }
                case PlayerStatus.PlayerO:
                    {
                        if (Users.PlayerO == null)
                        {
                            var user = new User
                            {
                                ID = userId,
                                Name = userName,
                                Status = PlayerStatus.PlayerO
                            };

                            Users.Add(user);
                        }
                        else
                        {
                            throw new Exception("There is already a PlayerO");
                        }
                        break;
                    }
                case PlayerStatus.Spectator:
                    {
                        var user = new User
                        {
                            ID = userId,
                            Name = userName,
                            Status = PlayerStatus.Spectator
                        };

                        Users.Add(user);
                        break;
                    }
            }

            CheckUsers();
        }

        public void DeauthUser(string userId)
        {
            Users.Delete(userId);
            CheckUsers();
        }

        public void Restart(string userId)
        {
            if(Users.GetByID(userId)?.Status == PlayerStatus.PlayerX ||
               Users.GetByID(userId)?.Status == PlayerStatus.PlayerO)
            if (GameState == GameState.Draw || 
               GameState == GameState.XWin || 
               GameState == GameState.OWin)
            {
                    Restart();
            }
        }

        private void Restart()
        {
            GameState = GameState.Preparing;
            for (int i = 0; i < Grid.GetLength(0); i++)
            {
                for (int j = 0; j < Grid.GetLength(1); j++)
                {
                    Grid[i, j] = Cell.Empty;
                }
            }
            CheckUsers();
        }

        public void RecieveMove(Move move, string userId)
        {
            if(Users.GetByID(userId) == null || 
                Users.GetByID(userId).Status == PlayerStatus.Spectator)
            {
                throw new Exception("You are not a player");
            }


            var gmstate = ProcessGrid();
            if (gmstate == (GameState.XWin | GameState.OWin))
            {
                if (Grid[move.X, move.Y] == Cell.Empty)
                {
                    switch (GameState)
                    {
                        case GameState.PlayerXTurn:
                            if (Users.GetByID(userId)?.Status == PlayerStatus.PlayerX)
                            {
                                ProcessMove(move);
                                GameState = GameState.PlayerOTurn;
                                break;
                            }
                            else
                            {
                                throw new Exception("Invalid move");
                            }
                        case GameState.PlayerOTurn:
                            if (Users.GetByID(userId)?.Status == PlayerStatus.PlayerO)
                            {
                                ProcessMove(move);
                                GameState = GameState.PlayerXTurn;
                                break;
                            }
                            else
                            {
                                throw new Exception("Invalid move");
                            }
                        default:
                            throw new Exception("Invalid move");
                    }

                    gmstate = ProcessGrid();
                    if(gmstate != (GameState.XWin | GameState.OWin))
                    {
                        GameState = gmstate;
                    }
                    return;
                }
                else //Если кто-то выиграл
                {
                    throw new Exception("Invalid move");
                }
                //до этой точки доходить никогда не должно
                throw new Exception("Reached unreachable point");
            }
            else
            {
                GameState = gmstate;
                return;
            }
        }

        private bool ProcessMove(Move move)
        {
            switch (GameState)
            {
                case GameState.PlayerXTurn:
                    if (Grid[move.X, move.Y] == Cell.Empty)
                    {
                        Grid[move.X, move.Y] = Cell.X;
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                case GameState.PlayerOTurn:
                    if (Grid[move.X, move.Y] == Cell.Empty)
                    {
                        Grid[move.X, move.Y] = Cell.O;
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                default:
                    return false;
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

            var emptys = 0;
            foreach(var i in Grid)
            {
                if (i == Cell.Empty)
                    emptys++;
            }
            if(emptys == 0)
            {
                return GameState.Draw;
            }

            return GameState.XWin | GameState.OWin;
        }

        private void CheckUsers()
        {
            if (GameState == GameState.Preparing &&
                Users.PlayerX != null &&
                Users.PlayerO != null)
            {
                GameState = GameState.PlayerXTurn;
            }
            else if(Users.PlayerX == null ||
                Users.PlayerO == null && 
                (GameState == GameState.PlayerOTurn || GameState == GameState.PlayerXTurn))
            {
                GameState = GameState.Draw;
            }
        }
    }
}