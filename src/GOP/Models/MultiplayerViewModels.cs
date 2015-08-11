using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace GOP.Models
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

    public class MultiplayerViewModel
    {
        public CustomAltar CustomAltar { get; set; }
        public IEnumerable<MultiplayerGameView> Games { get; set; }
        public string GopControls { get; set; }
    }
}
