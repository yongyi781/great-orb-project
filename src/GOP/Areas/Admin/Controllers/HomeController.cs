using GOP.Areas.Admin.Models;
using GOP.Hubs;
using GOP.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace GOP.Areas.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(Roles = "Administrators")]
    public class HomeController : Controller
    {
        public HomeController(ApplicationDbContext dbContext)
        {
            DbContext = dbContext;
        }

        public ApplicationDbContext DbContext { get; set; }

        public IActionResult ChatInfo()
        {
            return View(from u in ChatHub.ConnectedUsers
                        orderby u.Value.ConnectionTime
                        select new ChatInfoView
                        {
                            ConnectionID = u.Key,
                            ConnectionTime = u.Value.ConnectionTime,
                            UserId = u.Value.GopUser.UserId,
                            IpAddress = u.Value.GopUser.IpAddress,
                            Username = DbContext.GetUsername(u.Value.GopUser)
                        });
        }

        public IActionResult Puzzles(int lastId = int.MaxValue)
        {
            return View();
        }

        [Route("api/[area]/Puzzles")]
        public IEnumerable<PuzzleSubmissionAdminView> GetPuzzleSubmissions(int lastId = int.MaxValue)
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();

            return from s in DbContext.PuzzleSubmissions.AsNoTracking()
                   where s.Id <= lastId
                   select new PuzzleSubmissionAdminView
                   {
                       Submission = s,
                       Username = DbContext.GetUsername(new GopUser(s.UserId, s.IpAddress))
                   };
        }

        public IActionResult Test()
        {
            return View();
        }

        public IEnumerable<string> FindSoloCodeMismatches(bool save = false)
        {
            // Fix solo custom altar codes
            foreach (var item in DbContext.SoloGames)
            {
                var codeElements = item.Code.Split(new[] { ' ' }, 3);
                var altar = int.Parse(codeElements[1]);
                if (altar != item.Altar)
                {
                    codeElements[1] = item.Altar.ToString();
                    var newCode = string.Join(" ", codeElements);
                    yield return "Altar = " + item.Altar + ", code = " + item.Code + ", new code = " + newCode;
                    item.Code = newCode;
                }
            }
            if (save)
                DbContext.SaveChanges();
        }
    }
}
