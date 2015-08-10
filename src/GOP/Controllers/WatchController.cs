using GOP.Models;
using Microsoft.AspNet.Mvc;
using System.Linq;

namespace GOP.Controllers
{
    public class WatchController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [HttpGet("[controller]/{type}/{id}")]
        public IActionResult Index(GameType type, int id)
        {
            GopGame game = null;
            switch (type)
            {
                case GameType.Solo:
                    game = DbContext.SoloGames.Where(g => g.Id == id).FirstOrDefault();
                    break;
                case GameType.Multiplayer:
                    game = DbContext.MultiplayerGames.Where(g => g.Id == id).FirstOrDefault();
                    break;
                default:
                    break;
            }

            if (game == null)
                return HttpNotFound();

            // See if needs a custom altar
            CustomAltar customAltar = null;
            string altarName = null;
            if (game.Altar >= Utilities.AltarNames.Length)
            {
                customAltar = DbContext.CustomAltars.Where(a => a.Id == game.Altar).FirstOrDefault();
                altarName = customAltar.Name;
            }
            else
                altarName = Utilities.AltarNames[game.Altar];

            return View(new WatchView
            {
                Type = type,
                GameId = id,
                NumberOfOrbs = game.NumberOfOrbs,
                Seed = game.Seed,
                AltarName = altarName,
                Score = game.Score,
                Code = game.Code,
                CustomAltar = customAltar
            });
        }
    }
}
