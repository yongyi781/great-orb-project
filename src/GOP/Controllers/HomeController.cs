using GOP.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GOP.Controllers
{
    public class HomeController : Controller
    {
        public HomeController(IHostingEnvironment applicationEnvironment,
            ApplicationDbContext dbContext,
            UserManager<ApplicationUser> userManager)
        {
            ApplicationEnvironment = applicationEnvironment;
            DbContext = dbContext;
            UserManager = userManager;
        }

        public IHostingEnvironment ApplicationEnvironment { get; set; }
        public ApplicationDbContext DbContext { get; set; }
        public UserManager<ApplicationUser> UserManager { get; set; }

        public IActionResult Index()
        {
            ViewData["NumberOfMessages"] = DbContext.ChatMessages.Count();

            // Sync nickname cookies and database
            var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();
            var nickname = DbContext.Nicknames.Find(ipAddress);
            var cookieNickname = Request.Cookies[Utilities.NicknameCookieName];
            if (cookieNickname != null && nickname != null)
            {
                nickname.Name = cookieNickname;
                nickname.LastChanged = DateTimeOffset.Now;
                DbContext.SaveChanges();
            }
            else if (cookieNickname == null && nickname != null)
            {
                Response.Cookies.Append(Utilities.NicknameCookieName, nickname.Name);
            }
            else if (nickname == null && cookieNickname != null)
            {
                DbContext.Nicknames.Add(new Nickname
                {
                    IpAddress = ipAddress,
                    Name = cookieNickname,
                    LastChanged = DateTimeOffset.Now
                });
                DbContext.SaveChanges();
            }

            return View();
        }

        public object Test()
        {
            return "Hello world!!@!";
        }

        [HttpGet]
        public IActionResult Upload()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null)
                return BadRequest("There is no file.");
            var header = ContentDispositionHeaderValue.Parse(file.ContentDisposition);
            var fileNameWithExt = header.FileName.Trim('"');
            var fileName = Path.GetFileNameWithoutExtension(fileNameWithExt);
            var ext = Path.GetExtension(fileNameWithExt);
            var targetDir = Path.Combine(ApplicationEnvironment.WebRootPath, "uploads");

            bool alreadyExists = false;
            int i = 1;
            while (System.IO.File.Exists(Path.Combine(targetDir, fileNameWithExt)))
            {
                // Compare the files
                using (var fileStream = System.IO.File.OpenRead(Path.Combine(targetDir, fileNameWithExt)))
                {
                    // If the files are the same, then there is no need to save the file.
                    if (Utilities.StreamCompare(fileStream, file.OpenReadStream()))
                    {
                        alreadyExists = true;
                        break;
                    }
                }
                fileNameWithExt = fileName + (++i) + ext;
            }
            if (!alreadyExists)
            {
                using (var fs = System.IO.File.OpenWrite(Path.Combine(targetDir, fileNameWithExt)))
                {
                    await file.CopyToAsync(fs);
                }
            }

            return Content("http://" + Request.Host + "/uploads/" + Uri.EscapeDataString(fileNameWithExt));
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
