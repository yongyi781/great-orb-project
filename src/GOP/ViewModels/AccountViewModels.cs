using System.ComponentModel.DataAnnotations;

namespace GOP.ViewModels
{
    public class ExternalLoginConfirmationViewModel
    {
        [Required]
        public string Username { get; set; }
        [Display(Name = "Chat Color")]
        public string ChatColor { get; set; }
    }
}
