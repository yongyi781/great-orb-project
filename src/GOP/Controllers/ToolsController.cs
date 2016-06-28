using GOP.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace GOP.Controllers
{
    public class ToolsController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Anglemap(int? altar)
        {
            CustomAltar customAltar = null;
            if (altar > Utilities.NumberOfAltars)
                customAltar = DbContext.CustomAltars.Where(c => c.Id == altar).SingleOrDefault();
            return View(customAltar);
        }

        public IActionResult SpawnLister()
        {
            return View();
        }

        public IActionResult Cookies()
        {
            return View(Request.Cookies);
        }

        public IActionResult Test()
        {
            return View(DbContext.PuzzleSubmissions.ToList());
        }

        public IActionResult Test3D()
        {
            return View();
        }

        public IActionResult Compare()
        {
            return View();
        }

        public IActionResult Base64()
        {
            return View();
        }
    }
}
