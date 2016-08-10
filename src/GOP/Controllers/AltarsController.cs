using GOP.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace GOP.Controllers
{
    public class AltarsController : Controller
    {
        public AltarsController(ApplicationDbContext dbContext, ILogger<AltarsController> logger)
        {
            DbContext = dbContext;
            Logger = logger;
        }

        public ApplicationDbContext DbContext { get; set; }
        public ILogger<AltarsController> Logger { get; set; }

        public IActionResult Index()
        {
            return View(DbContext.GopAltars);
        }

        [HttpGet("api/[controller]")]
        public IEnumerable<GopAltar> Get(int? min, int? max)
        {
            IQueryable<GopAltar> query = DbContext.GopAltars.AsNoTracking();
            if (min != null)
                query = query.Where(altar => altar.Id >= min);
            if (max != null)
                query = query.Where(altar => altar.Id <= max);
            return query;
        }

        [HttpPost("api/[controller]")]
        public IActionResult Post(GopAltar altar)
        {
            // First, try to find it in the database
            var result = DbContext.GopAltars.Where(x => x.Grid == altar.Grid && x.Spawns == altar.Spawns).FirstOrDefault();
            var alreadyExists = true;
            if (result == null)
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                alreadyExists = false;
                result = altar;

                // Find first hole in IDs of table
                var ids = DbContext.GopAltars.Select(x => x.Id).ToList();
                ids.Sort();
                int newId = ids[ids.Count - 1] + 1;
                for (int i = 0; i < ids.Count - 1; i++)
                {
                    if (ids[i + 1] - ids[i] > 1)
                    {
                        newId = ids[i] + 1;
                        break;
                    }
                }

                altar.Id = newId;
                Logger.LogInformation("Saving altar {0}, {1}, {2}, {3}", altar.Id, altar.Name, altar.Grid, altar.Spawns);
                DbContext.GopAltars.Add(altar);
                DbContext.SaveChanges();
            }

            return new ObjectResult(new { AlreadyExists = alreadyExists, Id = result.Id });
        }

        [HttpGet("api/[controller]/names")]
        public IEnumerable<object> GetNames(int? min, int? max)
        {
            IQueryable<GopAltar> query = DbContext.GopAltars.AsNoTracking();
            if (min != null)
                query = query.Where(altar => altar.Id >= min);
            if (max != null)
                query = query.Where(altar => altar.Id <= max);
            return query.Select(altar => new { altar.Id, altar.Name });
        }

        [HttpGet("api/[controller]/{id}")]
        public IActionResult GetById(int id)
        {
            var altar = DbContext.GopAltars.Where(a => a.Id == id).FirstOrDefault();
            if (altar == null)
                return NotFound();
            return new ObjectResult(altar);
        }
    }
}
