using System.ComponentModel.DataAnnotations.Schema;

namespace GOP.Models
{
    public class GopAltar
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Grid { get; set; } = "";
        public string Spawns { get; set; } = "";
        public string? GroundColor { get; set; }
        public string? WaterColor { get; set; }
        public string? GroundPattern { get; set; }
    }
}
