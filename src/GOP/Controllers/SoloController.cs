using GOP.Models;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using System;
using System.Linq;

namespace GOP.Controllers
{
    public class SoloController : Controller
    {
        public const int DefaultMaxRandomSeed = 200;
        public const int MaxOrbs = 52;
        public const int DefaultReach = 10;

        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        public IActionResult Index(int? customId, string spawns, int reach = DefaultReach, int numOrbs = 3, int nGames = int.MaxValue)
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();

            CustomAltar customAltar = null;
            if (customId != null)
                customAltar = DbContext.CustomAltars.FirstOrDefault(a => a.Id == customId);

            numOrbs = Math.Min(MaxOrbs, numOrbs);
            var soloGames = from game in DbContext.SoloGames.AsNoTracking()
                            select GetSoloGameView(game);

            var isCustomGameType = spawns != null || reach != DefaultReach;

            return View(new SoloViewModel
            {
                CustomAltar = customAltar,
                IsCustomGameType = isCustomGameType,
                Games = isCustomGameType ? null : soloGames.Take(nGames)
            });
        }

        public IActionResult CustomAltars()
        {
            return View(DbContext.CustomAltars);
        }

        [HttpPost("api/[controller]")]
        public SoloGameView Post(int numberOfOrbs, int seed, int altar, int score, string code)
        {
            var soloGame = new SoloGame
            {
                Timestamp = DateTimeOffset.Now,
                UserId = User.GetUserIdInt32(),
                IpAddress = Context.Connection.RemoteIpAddress.ToString(),
                NumberOfOrbs = numberOfOrbs,
                Seed = seed,
                Altar = altar,
                Score = score,
                Code = code
            };

            DbContext.SoloGames.Add(soloGame);
            DbContext.SaveChanges();
            return GetSoloGameView(soloGame);
        }

        private SoloGameView GetSoloGameView(SoloGame game) => new SoloGameView
        {
            Id = game.Id,
            Timestamp = game.Timestamp,
            Username = DbContext.GetUsername(new GopUser(game.UserId, game.IpAddress)),
            NumberOfOrbs = game.NumberOfOrbs,
            Seed = game.Seed,
            Altar = game.Altar,
            Score = game.Score
        };
    }
}
