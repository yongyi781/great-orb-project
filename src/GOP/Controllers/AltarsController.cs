using GOP.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public IEnumerable<CustomAltar> Get(int? min, int? max)
        {
            IQueryable<CustomAltar> query = DbContext.CustomAltars.AsNoTracking();
            if (min != null)
                query = query.Where(altar => altar.Id >= min);
            if (max != null)
                query = query.Where(altar => altar.Id <= max);
            return query;
        }

        [HttpGet("api/[controller]/names")]
        public IEnumerable<object> Names(int? min, int? max)
        {
            IQueryable<CustomAltar> query = DbContext.CustomAltars.AsNoTracking();
            if (min != null)
                query = query.Where(altar => altar.Id >= min);
            if (max != null)
                query = query.Where(altar => altar.Id <= max);
            return query.Select(altar => new { altar.Id, altar.Name });
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
