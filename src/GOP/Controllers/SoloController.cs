using GOP.Models;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using System;
using System.Collections.Generic;
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

        public IActionResult Index(int? customId, string spawns, int reach = DefaultReach, int numOrbs = 3)
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();

            CustomAltar customAltar = null;
            if (customId != null)
                customAltar = DbContext.CustomAltars.FirstOrDefault(a => a.Id == customId);

            var soloGames = GetSoloGames();

            var isCustomGameType = spawns != null || reach != DefaultReach;

            return View(new SoloViewModel
            {
                CustomAltar = customAltar,
                IsCustomGameType = isCustomGameType,
                Games = isCustomGameType ? null : soloGames
            });
        }

        public IActionResult CustomAltars()
        {
            return View(DbContext.CustomAltars);
        }

        [HttpGet("api/[controller]")]
        public IEnumerable<SoloGameView> Get()
        {
            return GetSoloGames();
        }

        [HttpGet("api/[controller]/{id}")]
        public IActionResult Get(int id)
        {
            var result = DbContext.SoloGames.Where(g => g.Id == id).FirstOrDefault();
            if (result == null)
                return HttpNotFound();
            return new ObjectResult(GetSoloGameView(result));
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

        private IQueryable<SoloGameView> GetSoloGames() =>
            from game in DbContext.SoloGames.AsNoTracking()
            select GetSoloGameView(game);

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
