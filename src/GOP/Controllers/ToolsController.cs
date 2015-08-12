using GOP.Models;
using Microsoft.AspNet.Mvc;
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

        public IActionResult Anglemap(int? customId)
        {
            return View(DbContext.CustomAltars.Where(c => c.Id == customId).SingleOrDefault());
        }

        public IActionResult SpawnLister()
        {
            return View();
        }

        public IActionResult Test()
        {
            return View();
        }

        public IActionResult Test3D()
        {
            return View();
        }
    }
}
