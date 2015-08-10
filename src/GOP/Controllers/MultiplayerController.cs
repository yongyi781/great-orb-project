using GOP.Models;
using Microsoft.AspNet.Mvc;
using System;
using System.Linq;
using System.Text.RegularExpressions;

namespace GOP.Controllers
{
    public class MultiplayerController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [HttpGet]
        public IActionResult Index(int nGames = int.MaxValue)
        {
            var multiplayerGames = from game in DbContext.MultiplayerGames
                                   orderby game.Id descending
                                   select new MultiplayerGameView
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

            return View(new MultiplayerViewModel { CustomAltar = null, Games = multiplayerGames.Take(nGames) });
        }

        [HttpPost("api/[controller]")]
        public MultiplayerGame Post(int numberOfOrbs, int seed, int altar, int score, string code)
        {
            throw new NotImplementedException();
        }
    }
}
