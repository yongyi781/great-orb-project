using GOP.Models;
using System;
using System.Collections.Generic;

namespace GOP.ViewModels
{
    public class MultiplayerGameView
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public int NumberOfPlayers { get; set; }
        public string Usernames { get; set; }
        public int NumberOfOrbs { get; set; }
        public int Seed { get; set; }
        public int Altar { get; set; }
        public int Score { get; set; }
    }

    public class MultiplayerHistoryViewModel
    {
        public IEnumerable<MultiplayerGameView> Games { get; set; }
    }
}
