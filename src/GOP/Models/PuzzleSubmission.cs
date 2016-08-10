using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GOP.Models
{
    public class PuzzleSubmission
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }

        public int PuzzleId { get; set; }
        public Puzzle Puzzle { get; set; }

        public int? UserId { get; set; }
        public ApplicationUser User { get; set; }

        [Required]
        [Column(TypeName = "varchar(50)")]
        public string IpAddress { get; set; }
        public int Score { get; set; }
        [Required]
        public string Code { get; set; }
    }
}
