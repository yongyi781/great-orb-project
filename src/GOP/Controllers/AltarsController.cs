using GOP.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace GOP.Controllers
{
    public class AltarsController : Controller
    {
        public AltarsController(ApplicationDbContext db)
        {
            DbContext = db;
        }

        public ApplicationDbContext DbContext { get; set; }

        public IActionResult Index()
        {
            return View(DbContext.CustomAltars);
        }

        [HttpGet("api/[controller]")]
        public IEnumerable<CustomAltar> Get()
        {
            return DbContext.CustomAltars;
        }

        [HttpGet("api/[controller]/{id}")]
        public IActionResult Get(int id)
        {
            var altar = DbContext.CustomAltars.Where(a => a.Id == id).FirstOrDefault();
            if (altar == null)
                return NotFound();
            return new ObjectResult(altar);
        }
    }
}
