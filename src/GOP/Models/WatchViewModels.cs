namespace GOP.Models
{
    public enum GameType { Solo, Multiplayer }

    public class WatchView
    {
        public GameType Type { get; set; }
        public int GameId { get; set; }
        public int NumberOfOrbs { get; set; }
        public string AltarName { get; set; }
        public int Seed { get; set; }
        public int Score { get; set; }
        public string Code { get; set; }
        public CustomAltar CustomAltar { get; set; }
    }
}
