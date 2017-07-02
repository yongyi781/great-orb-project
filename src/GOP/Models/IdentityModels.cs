using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GOP.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string ChatColor { get; set; }
    }

    public class ChatMessage
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        [Required]
        [Column(TypeName = "varchar(50)")]
        public string IpAddress { get; set; }

        public int? UserId { get; set; }
        public ApplicationUser User { get; set; }

        [Required]
        public string Text { get; set; }

    }

    public class Nickname
    {
        [Key]
        [Column(TypeName = "varchar(50)")]
        public string IpAddress { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }
        public DateTimeOffset LastChanged { get; set; }
    }
}
