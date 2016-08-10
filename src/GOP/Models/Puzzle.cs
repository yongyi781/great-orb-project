using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GOP.Models
{
    public class Puzzle
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        public int Altar { get; set; }
        [ForeignKey("Altar")]
        public GopAltar GopAltar { get; set; }

        public int NumberOfOrbs { get; set; }
        public int NumberOfPlayers { get; set; }
        [Required]
        public string Orbs { get; set; }
        [Required]
        public string StartLocations { get; set; }

        public List<PuzzleSubmission> PuzzleSubmissions { get; set; }
    }
}
