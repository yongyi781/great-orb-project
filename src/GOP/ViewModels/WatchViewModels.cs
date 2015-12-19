using GOP.Models;

namespace GOP.ViewModels
{
    public enum GameType { Solo, Multiplayer }

    public class WatchView
    {
        public GameType Type { get; set; }
        public GopGame Game { get; set; }
        public string AltarName { get; set; }
        public CustomAltar CustomAltar { get; set; }
    }
}
