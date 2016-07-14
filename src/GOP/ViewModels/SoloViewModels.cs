using GOP.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace GOP.ViewModels
{
    public class SoloGameView
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public string Username { get; set; }
        public int NumberOfOrbs { get; set; }
        public int Seed { get; set; }
        public int Altar { get; set; }
        public int Score { get; set; }
    }

    public class SoloViewModel
    {
        public CustomAltar CustomAltar { get; set; }
        public IEnumerable<SoloGameView> Games { get; set; }
        public bool IsCustomGameType { get; set; }
        public string GopControls { get; set; }
    }

    public class SoloGamesViewModel
    {
        public IEnumerable<SoloGameView> Games { get; set; }
    }
}
