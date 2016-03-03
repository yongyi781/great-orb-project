using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;

namespace GOP.Controllers
{
    public class DeadPracticeController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [FromServices]
        public UserManager<ApplicationUser> UserManager { get; set; }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult View(int id)
        {
            var result = DbContext.DeadPracticeResults.SingleOrDefault(r => r.Id == id);
            if (result == null)
                return NotFound();

            var data = JArray.Parse(result.Data);
            var count = data.Count;
            var orderedTimes = (from s in data
                                orderby s["click"]["time"]
                                select (double)s["click"]["time"]).ToList();
            var median = (orderedTimes[count / 2] + orderedTimes[(count - 1) / 2]) / 2;
            return View(new DeadPracticeResultViewModel
            {
                Id = result.Id,
                Timestamp = result.Timestamp,
                Username = DbContext.GetUsername(new GopUser(result.UserId, result.IpAddress)),
                Settings = JsonConvert.DeserializeObject(result.Settings),
                Data = data,
                MinTime = orderedTimes.Min(),
                MedianTime = median,
                AverageTime = orderedTimes.Average(),
                MisclickRate = data.Average(s => s["misclicks"].Count())
            });
        }

        [HttpPost("api/[controller]")]
        public string Post(string settings, string data)
        {
            var userId = UserManager.GetUserIdInt32(User);

            // First try to find it in the database
            var result = DbContext.DeadPracticeResults.Where(r => r.Settings == settings && r.Data == data).FirstOrDefault();
            if (result == null)
            {
                result = new DeadPracticeResult
                {
                    Timestamp = DateTimeOffset.Now,
                    UserId = userId == -1 ? null : userId,
                    IpAddress = HttpContext.Connection.RemoteIpAddress.ToString(),
                    Settings = settings,
                    Data = data
                };
                DbContext.DeadPracticeResults.Add(result);
                DbContext.SaveChanges();
            }

            return "http://" + HttpContext.Request.Host + "/DeadPractice/View/" + result.Id;
        }
    }
}
