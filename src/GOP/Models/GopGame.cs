using System;
using System.ComponentModel.DataAnnotations;

namespace GOP.Models
{
    public class GopGame
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public int NumberOfOrbs { get; set; }
        public int Seed { get; set; }
        public int Altar { get; set; }
        public int Score { get; set; }
        [Required]
        public string Code { get; set; }
    }

    public class SoloGame : GopGame
    {
        public int? UserId { get; set; }
        [Required]
        public string IpAddress { get; set; }

        public virtual ApplicationUser User { get; set; }
    }

    public class MultiplayerGame : GopGame
    {
        public int NumberOfPlayers { get; set; }
        [Required]
        public string Usernames { get; set; }
    }
}
