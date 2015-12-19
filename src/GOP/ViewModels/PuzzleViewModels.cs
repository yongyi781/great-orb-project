using GOP.Controllers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace GOP.ViewModels
{
    public class PuzzleView
    {
        public int Id { get; set; }
        public int Altar { get; set; }
        public int NumberOfOrbs { get; set; }
        public int NumberOfPlayers { get; set; }
        public string Orbs { get; set; }
        public string StartLocations { get; set; }
        public int NumberOfSolvers { get; set; }
        public int Par { get; set; } = int.MaxValue;
        public int Score { get; set; } = int.MaxValue;
        public int PuzzlePoints { get; set; }

        public bool IsSolved() => PuzzlePoints == PuzzlesController.MaxScorePerPuzzle;
        public bool IsAttempted() => Score != int.MaxValue;
    }

    public class PuzzleSubmissionView
    {
        public int Id { get; set; }
        public DateTimeOffset Timestamp { get; set; }
        public string Username { get; set; }
        public int Score { get; set; }
        public string Code { get; set; }
    }

    public class PuzzleViewModel
    {
        public PuzzleView PuzzleView { get; set; }
        public IEnumerable<PuzzleSubmissionView> Submissions { get; set; }
        public bool RequireLogin { get; set; }
        public string GopControls { get; set; }
    }

    public class PuzzleLeaderboardEntry
    {
        public int Rank { get; set; }
        public string Username { get; set; }
        public int Points { get; set; }
    }
}
