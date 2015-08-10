using GOP.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace GOP.Controllers
{
    public class HomeController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [FromServices]
        public UserManager<ApplicationUser> UserManager { get; set; }

        public IActionResult Index()
        {
            ViewData["NumberOfMessages"] = DbContext.ChatMessages.Count();
            return View();
        }

        public object Test()
        {
            return "Hello world!!@!";
        }

        public IEnumerable<string> FindSoloCodeMismatches()
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
                    item.Code = newCode;
                    yield return newCode;
                }
            }
            DbContext.SaveChanges();
        }

        public IActionResult ThrowException()
        {
            throw new Exception();
        }

        public IActionResult Error()
        {
            return View("~/Views/Shared/Error.cshtml");
        }
    }
}
