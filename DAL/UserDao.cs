using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TicTacToe.Entities;

namespace TicTacToe.DAL
{
    public class UserDao
    {
        private List<User> _users = new List<User>();

        public User PlayerX => _users
            .FirstOrDefault(u => u.Status == PlayerStatus.PlayerX);

        public User PlayerO => _users
            .FirstOrDefault(u => u.Status == PlayerStatus.PlayerO);

        public List<User> Spectators => _users
            .Where(u => u.Status == PlayerStatus.Spectator)
            .ToList();

        public void Add(User user)
        {
            if (_users.Exists(u => u.ID == user.ID))
            {
                throw new Exception("User with that ID is already authorized");
            }

            _users.Add(user);
        }

        public bool Delete(string id)
        {
            if (_users.Exists(x => x.ID == id))
            {
                _users.RemoveAll(x => x.ID == id);
                return true;
            }
            else
            {
                return false;
            }
        }

        public User GetByID(string id)
        {
            return (from u in _users
                    where u.ID == id
                    select u).SingleOrDefault();
        }
    }
}
