using GOP.Models;
using Microsoft.AspNet.Mvc;
using System;
using System.Linq;

namespace GOP.Controllers
{
    public class MultiplayerController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }
        
        public IActionResult Index(int nGames = int.MaxValue)
        {
            var multiplayerGames = GetMultiplayerGames();

            return View(new MultiplayerViewModel { CustomAltar = null, Games = multiplayerGames.Take(nGames) });
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
                return HttpNotFound();
            return new ObjectResult(GetMultiplayerGameView(result));
        }

        [HttpPost("api/[controller]")]
        public MultiplayerGameView Post(int numberOfOrbs, int seed, int altar, int score, string code)
        {
            throw new NotImplementedException();
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
    }
}
