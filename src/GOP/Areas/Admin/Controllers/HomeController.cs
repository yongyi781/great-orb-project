using GOP.Areas.Admin.Models;
using GOP.Hubs;
using GOP.Models;
using Microsoft.AspNetCore.Authorization;
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
        [FromServices]
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
            return View(GetPuzzleSubmissions());
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
    }
}
