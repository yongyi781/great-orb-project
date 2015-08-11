using System;
using System.ComponentModel.DataAnnotations;

namespace GOP.Models
{
    public class PuzzleSubmission
    {
        public int Id { get; set; }
        public int PuzzleId { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public int? UserId { get; set; }
        [Required]
        public string IpAddress { get; set; }
        public int Score { get; set; }
        [Required]
        public string Code { get; set; }

        protected virtual Puzzle Puzzle { get; set; }
        protected virtual ApplicationUser User { get; set; }
    }
}
