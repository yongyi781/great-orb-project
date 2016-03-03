using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GOP.Controllers
{
    public class MultiplayerController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [FromServices]
        public UserManager<ApplicationUser> UserManager { get; set; }

        public async Task<IActionResult> Index()
        {
            var multiplayerGames = GetMultiplayerGames();
            var currentUser = await GetCurrentUserAsync();

            return View(new MultiplayerViewModel
            {
                CustomAltar = null,
                Games = multiplayerGames,
                GopControls = currentUser?.GopControls
            });
        }

        public async Task<IActionResult> Index2()
        {
            var multiplayerGames = GetMultiplayerGames();
            var currentUser = await GetCurrentUserAsync();

            return View(new MultiplayerViewModel
            {
                CustomAltar = null,
                Games = multiplayerGames,
                GopControls = currentUser?.GopControls
            });
        }

        [HttpGet("api/[controller]")]
        public IQueryable<MultiplayerGameView> Get()
        {
            return GetMultiplayerGames();
        }

        [HttpGet("api/[controller]/{id}")]
        public IActionResult Get(int id)
        {
            var result = DbContext.MultiplayerGames.Where(g => g.Id == id).FirstOrDefault();
            if (result == null)
                return NotFound();
            return new ObjectResult(GetMultiplayerGameView(result));
        }

        [HttpPost("api/[controller]/solo")]
        public void PostSolo(int numberOfPlayers, int numberOfOrbs, int seed, int altar, int score, string code)
        {
            var username = DbContext.GetUsername(GopUser.GetCurrentUser(HttpContext));
            var usernames = string.Join("; ", Enumerable.Repeat(username, numberOfPlayers));

            var game = new MultiplayerGame
            {
                Timestamp = DateTimeOffset.Now,
                NumberOfPlayers = numberOfPlayers,
                Usernames = usernames,
                NumberOfOrbs = numberOfOrbs,
                Seed = seed,
                Altar = altar,
                Score = score,
                Code = code
            };

            DbContext.MultiplayerGames.Add(game);
            DbContext.SaveChanges();
        }

        private IQueryable<MultiplayerGameView> GetMultiplayerGames() =>
            from game in DbContext.MultiplayerGames
            orderby game.Id descending
            select GetMultiplayerGameView(game);

        private MultiplayerGameView GetMultiplayerGameView(MultiplayerGame game) =>
            new MultiplayerGameView
            {
                Id = game.Id,
                Timestamp = game.Timestamp,
                NumberOfPlayers = game.NumberOfPlayers,
                Usernames = game.Usernames,
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
