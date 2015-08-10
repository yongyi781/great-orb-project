using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using GOP.Models;
using GOP.Hubs;
using GOP.Areas.Admin.Models;
using Microsoft.Data.Entity;
using Microsoft.AspNet.Authorization;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

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

        public IActionResult Puzzles(int n = int.MaxValue, int lastId = int.MaxValue)
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();
            var views = from s in DbContext.PuzzleSubmissions.AsNoTracking()
                        where s.Id <= lastId
                        select new PuzzleSubmissionAdminView
                        {
                            Submission = s,
                            Username = DbContext.GetUsername(new GopUser(s.UserId, s.IpAddress))
                        };
            return View(views.Take(n).ToList());
        }

        [Route("api/[area]/Puzzles")]
        public IEnumerable<PuzzleSubmissionAdminView> GetPuzzleSubmissions()
        {
            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();

            var query = from s in DbContext.PuzzleSubmissions
                        orderby s.Id descending
                        select new PuzzleSubmissionAdminView
                        {
                            Submission = s,
                            Username = DbContext.GetUsername(new GopUser(s.UserId, s.IpAddress))
                        };
            return query;
        }
    }
}
