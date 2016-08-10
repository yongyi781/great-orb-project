using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GOP.Models
{
    public class GopAltar
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Grid { get; set; }
        [Required]
        public string Spawns { get; set; }
        public string GroundColor { get; set; }
        public string WaterColor { get; set; }
        public string GroundPattern { get; set; }
    }
}
