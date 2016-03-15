using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GOP.Controllers
{
    public class PuzzlesController : Controller
    {
        public const int MaxScorePerPuzzle = 10;

        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [FromServices]
        public UserManager<ApplicationUser> UserManager { get; set; }

        [HttpGet]
        public IActionResult Index(string u)
        {
            GopUser gopUser = GopUser.GetCurrentUser(HttpContext);
            if (u != null)
            {
                // Try to find user
                var user = DbContext.Users.SingleOrDefault(x => x.UserName == u);
                if (user != null)
                    gopUser = new GopUser(user.Id, null);
            }
            var views = from puzzle in DbContext.Puzzles.Include(p => p.PuzzleSubmissions).AsNoTracking().AsEnumerable()
                        select GetPuzzleView(puzzle, gopUser);
            return View(views);
        }

        [HttpGet("Puzzle/{id}")]
        public async Task<IActionResult> Puzzle(int id)
        {
            var puzzle = DbContext.Puzzles.AsNoTracking().Include(p => p.PuzzleSubmissions).SingleOrDefault(p => p.Id == id);
            if (puzzle == null)
                return NotFound();

            var puzzleView = GetPuzzleView(puzzle, GopUser.GetCurrentUser(HttpContext));
            var submissions = puzzleView.IsSolved() ?
                puzzle.PuzzleSubmissions :
                puzzle.PuzzleSubmissions.Where(s => new GopUser(s.UserId, s.IpAddress).Equals(GopUser.GetCurrentUser(HttpContext)));

            var submissionViews = from s in submissions
                                  select GetPuzzleSubmissionView(s);

            var currentUser = await GetCurrentUserAsync();
            var requireLogin = !User.Identity.IsAuthenticated &&
                (from s in DbContext.PuzzleSubmissions.AsNoTracking()
                 where s.IpAddress == HttpContext.Connection.RemoteIpAddress.ToString() && s.UserId != null
                 select 0).Count() > 0;

            return View("Puzzle", new PuzzleViewModel
            {
                PuzzleView = puzzleView,
                Submissions = submissionViews,
                RequireLogin = requireLogin,
                GopControls = currentUser?.GopControls
            });
        }

        public IActionResult Leaderboard()
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();
            var hiscores = new Dictionary<string, int>();
            var filteredPuzzles = DbContext.Puzzles.AsNoTracking().Include(p => p.PuzzleSubmissions);
            foreach (var puzzle in filteredPuzzles)
            {
                if (puzzle.PuzzleSubmissions.Count == 0)
                    continue;
                var par = puzzle.PuzzleSubmissions.Min(s => s.Score);
                foreach (var pg in puzzle.PuzzleSubmissions.GroupBy(s => DbContext.GetUsername(new GopUser(s.UserId, s.IpAddress))))
                {
                    var min = pg.Min(s => s.Score);
                    if (!hiscores.ContainsKey(pg.Key))
                    {
                        hiscores[pg.Key] = 0;
                    }
                    hiscores[pg.Key] += GetPuzzlePoints(par, min);
                }
            }

            var entries = (from item in hiscores
                           where item.Value >= 100
                           orderby item.Value descending
                           select new PuzzleLeaderboardEntry
                           {
                               Username = item.Key,
                               Points = item.Value
                           }).ToList();

            // Calculate ranks
            for (int i = 0; i < entries.Count; i++)
            {
                if (i != 0 && entries[i].Points == entries[i - 1].Points)
                    entries[i].Rank = entries[i - 1].Rank;
                else
                    entries[i].Rank = i + 1;
            }

            return View(entries);
        }

        [HttpPost("api/[controller]/{id}")]
        public PuzzleSubmissionView Post(int id, int score, string code)
        {
            var submission = new PuzzleSubmission
            {
                PuzzleId = id,
                Timestamp = DateTimeOffset.Now,
                IpAddress = HttpContext.Connection.RemoteIpAddress.ToString(),
                UserId = UserManager.GetUserIdInt32(User),
                Score = score,
                Code = code
            };
            DbContext.PuzzleSubmissions.Add(submission);
            DbContext.SaveChanges();
            return GetPuzzleSubmissionView(submission);
        }

        private PuzzleView GetPuzzleView(Puzzle puzzle, GopUser user)
        {
            var view = new PuzzleView
            {
                Id = puzzle.Id,
                Altar = puzzle.Altar,
                NumberOfOrbs = puzzle.NumberOfOrbs,
                NumberOfPlayers = puzzle.NumberOfPlayers,
                Orbs = puzzle.Orbs,
                StartLocations = puzzle.StartLocations
            };

            var submissions = puzzle.PuzzleSubmissions;
            if (submissions.Count == 0)
                return view;

            view.Par = submissions.Min(s => s.Score);
            view.NumberOfSolvers = submissions.Where(s => s.Score == view.Par).GroupBy(s => new GopUser(s.UserId, s.IpAddress)).Count();
            var userScores = submissions
                .Where(s => user.Equals(new GopUser(s.UserId, s.IpAddress)))
                .Select(s => s.Score)
                .ToList();
            if (userScores.Count > 0)
            {
                view.Score = userScores.Min();
                view.PuzzlePoints = GetPuzzlePoints(view.Par, view.Score);
            }

            return view;
        }

        private PuzzleSubmissionView GetPuzzleSubmissionView(PuzzleSubmission submission) => new PuzzleSubmissionView
        {
            Id = submission.Id,
            Timestamp = submission.Timestamp,
            Username = DbContext.GetUsername(new GopUser(submission.UserId, submission.IpAddress)),
            Score = submission.Score,
            Code = submission.Code
        };

        private int GetPuzzlePoints(int par, int score) =>
            score == par ? MaxScorePerPuzzle : Math.Max(0, MaxScorePerPuzzle / 2 - score + par + 1);

        private async Task<ApplicationUser> GetCurrentUserAsync()
        {
            return await UserManager.FindByIdAsync(UserManager.GetUserId(User));
        }
    }
}
