using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.ComponentModel.DataAnnotations;

namespace GOP.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string ChatColor { get; set; }
        public string GopControls { get; set; }
    }

    public class ChatMessage
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        [Required]
        [MaxLength(50)]
        public string IpAddress { get; set; }
        public int? UserId { get; set; }
        [Required]
        public string Text { get; set; }

        public virtual ApplicationUser User { get; set; }
    }

    public class Nickname
    {
        [Required]
        [MaxLength(50)]
        public string IpAddress { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }
        public DateTimeOffset LastChanged { get; set; }
    }
}
