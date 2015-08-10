using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GOP.Models
{
    public class CustomAltar
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string GridJS { get; set; }
        [Required]
        public string SpawnsJS { get; set; }
    }
}
