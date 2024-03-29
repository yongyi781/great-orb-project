﻿using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GOP.Controllers
{
    public class SoloController : Controller
    {
        public const int DefaultMaxRandomSeed = 200;
        public const int MaxOrbs = 52;
        public const int DefaultReach = 10;
        public const int DefaultTicks = 199;

        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [FromServices]
        public UserManager<ApplicationUser> UserManager { get; set; }

        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> Legacy(string spawns, int reach = DefaultReach, int ticks = DefaultTicks)
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();
            
            var soloGames = GetSoloGames().AsEnumerable().OrderByDescending(g => g.Id).Take(10);

            var isCustomGameType = spawns != null || reach != DefaultReach || ticks != DefaultTicks;
            var currentUser = await GetCurrentUserAsync();

            return View(new SoloViewModel
            {
                IsCustomGameType = isCustomGameType,
                Games = isCustomGameType ? null : soloGames
            });
        }

        public IActionResult History()
        {
            return View();
        }

        [HttpGet("api/[controller]")]
        public IEnumerable<SoloGameView> Get()
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();

            return GetSoloGames();
        }

        [HttpGet("api/[controller]/{id}")]
        public IActionResult Get(int id)
        {
            var result = DbContext.SoloGames.Where(g => g.Id == id).FirstOrDefault();
            if (result == null)
                return NotFound();
            return new ObjectResult(GetSoloGameView(result, DbContext));
        }

        [HttpPost("api/[controller]")]
        public SoloGameView Post(int numberOfOrbs, int seed, int altar, int score, string code)
        {
            var soloGame = new SoloGame
            {
                Timestamp = DateTimeOffset.Now,
                UserId = UserManager.GetUserIdInt32(User),
                IpAddress = HttpContext.Connection.RemoteIpAddress.ToShortString(),
                NumberOfOrbs = numberOfOrbs,
                Seed = seed,
                Altar = altar,
                Score = score,
                Code = code
            };

            DbContext.SoloGames.Add(soloGame);
            DbContext.SaveChanges();
            return GetSoloGameView(soloGame, DbContext);
        }

        private IQueryable<SoloGameView> GetSoloGames() =>
            from game in DbContext.SoloGames.AsNoTracking()
            select GetSoloGameView(game, DbContext);

        private static SoloGameView GetSoloGameView(SoloGame game, ApplicationDbContext db) => new SoloGameView
        {
            Id = game.Id,
            Timestamp = game.Timestamp,
            Username = db.GetUsername(new GopUser(game.UserId, game.IpAddress)),
            NumberOfOrbs = game.NumberOfOrbs,
            Seed = game.Seed,
            Altar = game.Altar,
            Score = game.Score
        };

        private async Task<ApplicationUser> GetCurrentUserAsync()
        {
            return await UserManager.FindByIdAsync(UserManager.GetUserId(User));
        }
    }
}
