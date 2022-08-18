using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GOP.Models
{
    public class GopGame
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public int NumberOfOrbs { get; set; }
        public int Seed { get; set; }

        public int Altar { get; set; }
        [ForeignKey("Altar")]
        public GopAltar? GopAltar { get; set; }

        public int Score { get; set; }
        [Required]
        public string Code { get; set; } = "";
    }

    public class SoloGame : GopGame
    {
        public int? UserId { get; set; }
        public ApplicationUser? User { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string IpAddress { get; set; } = "";

    }

    public class MultiplayerGame : GopGame
    {
        public int NumberOfPlayers { get; set; }
        [Required]
        public string Usernames { get; set; } = "";
    }
}
