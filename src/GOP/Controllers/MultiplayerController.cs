using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GOP.Controllers
{
    public class MultiplayerController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [FromServices]
        public UserManager<ApplicationUser> UserManager { get; set; }
        
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("[controller]/i/{name}")]
        public IActionResult Instance(string name)
        {
            ViewData["Instance"] = name;
            return View(nameof(Index));
        }

        public IActionResult History()
        {
            return View();
        }

        [HttpGet("api/[controller]")]
        public IQueryable<MultiplayerGameView> Get()
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();

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

        [HttpPost("api/[controller]")]
        public void Post(ICollection<string> playerNames, int numberOfOrbs, int seed, int altar, int score, string code)
        {
            var game = new MultiplayerGame
            {
                Timestamp = DateTimeOffset.Now,
                NumberOfPlayers = playerNames.Count,
                Usernames = string.Join("; ", playerNames),
                NumberOfOrbs = numberOfOrbs,
                Seed = seed,
                Altar = altar,
                Score = score,
                Code = code
            };

            DbContext.MultiplayerGames.Add(game);
            DbContext.SaveChanges();
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

        private static MultiplayerGameView GetMultiplayerGameView(MultiplayerGame game) =>
            new()
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
