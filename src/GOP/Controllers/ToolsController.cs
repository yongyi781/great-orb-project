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

        public IActionResult Anglemap()
        {
            return View();
        }

        public IActionResult SpawnLister()
        {
            return View();
        }

        public IActionResult Cookies()
        {
            return View();
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
