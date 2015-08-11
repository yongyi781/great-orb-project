using GOP.Models;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace GOP.Controllers
{
    public class HiscoresController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [HttpGet("[controller]/{type?}")]
        public IActionResult Index(HiscoresGameType type, string user, bool fullOnly, int numOrbs = 3, int minSeed = 0, int maxSeed = int.MaxValue)
        {
            ViewData[type + "Active"] = "active";
            var viewModel = Get(type, user, fullOnly, numOrbs, minSeed, maxSeed);
            if (viewModel == null)
                return HttpNotFound();
            return View(viewModel);
        }

        [HttpGet("api/[controller]/{type?}")]
        public HiscoresViewModel Get(HiscoresGameType type, string user, bool fullOnly, int numOrbs = 3, int minSeed = 0, int maxSeed = int.MaxValue)
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();

            IQueryable<GopGame> games = null;
            if (type == HiscoresGameType.Solo)
            {
                var soloGames = from g in DbContext.SoloGames.AsNoTracking()
                                where g.Altar >= 1 &&
                                      g.Altar <= 6 &&
                                      g.NumberOfOrbs == numOrbs &&
                                      g.Seed >= minSeed && g.Seed <= maxSeed
                                select g;
                if (user != null)
                    soloGames = soloGames.Where(g => DbContext.GetUsername(new GopUser(g.UserId, g.IpAddress)).Equals(user, StringComparison.CurrentCultureIgnoreCase));
                games = soloGames;
            }
            else
            {
                var multiplayerGames = from g in DbContext.MultiplayerGames.AsNoTracking()
                                       where g.NumberOfPlayers == (int)type + 1 &&
                                             g.Altar >= 1 && g.Altar <= 6 &&
                                             g.NumberOfOrbs == numOrbs &&
                                             g.Seed >= minSeed && g.Seed <= maxSeed
                                       select g;
                if (user != null)
                    multiplayerGames = multiplayerGames.Where(g => g.Usernames.Contains(user));
                games = multiplayerGames;
            }

            if (games == null)
                return null;

            var maxesBySeedAndAltar = from g in games
                                      group g.Score by new { g.Seed, g.Altar } into gg
                                      select new SeedAltarScoreEntry
                                      {
                                          Seed = gg.Key.Seed,
                                          Altar = gg.Key.Altar,
                                          Score = gg.Max()
                                      };
            return GetHiscoresView(maxesBySeedAndAltar, fullOnly);
        }

        private HiscoresViewModel GetHiscoresView(IEnumerable<SeedAltarScoreEntry> seedAltarMaxes, bool fullOnly)
        {
            var rows = seedAltarMaxes.GroupBy(m => m.Seed).Select(g =>
            {
                var seedMaxes = new int?[6];
                foreach (var s in g)
                    seedMaxes[s.Altar - 1] = s.Score;
                return new HiscoresRow { Seed = g.Key, Scores = seedMaxes };
            });

            if (fullOnly)
                rows = rows.Where(r => r.Sum != null);
            rows = rows.ToList();

            var counts = new int?[6];
            var maxes = new int?[6];
            var mins = new int?[6];
            var averages = new double?[6];
            var stddevs = new double?[6];
            for (int i = 0; i < 6; i++)
            {
                counts[i] = rows.Count(r => r.Scores[i] != null);
                maxes[i] = rows.Max(r => r.Scores[i]);
                mins[i] = rows.Min(r => r.Scores[i]);
                averages[i] = rows.Average(r => r.Scores[i]);
                stddevs[i] = rows.StdDev(r => r.Scores[i]);
            }

            var countSum = rows.Count(r => r.Sum != null);
            var maxSum = rows.Max(r => r.Sum);
            var minSum = rows.Min(r => r.Sum);
            var averageSum = rows.Average(r => r.Sum);
            var stddevSum = rows.StdDev(r => r.Sum);

            return new HiscoresViewModel
            {
                Rows = rows,
                Counts = new HiscoresAggregateRow<int> { ScoreValues = counts, SumValue = countSum },
                Mins = new HiscoresAggregateRow<int> { ScoreValues = mins, SumValue = minSum },
                Maxes = new HiscoresAggregateRow<int> { ScoreValues = maxes, SumValue = maxSum },
                Averages = new HiscoresAggregateRow<double> { ScoreValues = averages, SumValue = averageSum },
                StandardDeviations = new HiscoresAggregateRow<double> { ScoreValues = stddevs, SumValue = stddevSum },
                MinTotalIndex = mins.Sum(),
                MaxTotalIndex = maxes.Sum()
            };
        }
    }
}
