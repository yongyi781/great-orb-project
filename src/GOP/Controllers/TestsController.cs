using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace GOP.Controllers
{
    public class TestsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult GameEngine()
        {
            return View();
        }
    }
}
