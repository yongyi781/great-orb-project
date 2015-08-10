using System;
using System.ComponentModel.DataAnnotations;

namespace GOP.Models
{
    public class DeadPracticeResult
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public int? UserId { get; set; }
        [Required]
        public string IpAddress { get; set; }
        [Required]
        public string Settings { get; set; }
        [Required]
        public string Data { get; set; }

        public virtual ApplicationUser User { get; set; }
    }
}
