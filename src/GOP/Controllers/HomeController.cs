﻿using GOP.Models;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Mvc;
using Microsoft.Extensions.PlatformAbstractions;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace GOP.Controllers
{
    public class HomeController : Controller
    {
        [FromServices]
        public IApplicationEnvironment ApplicationEnvironment { get; set; }

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

        [HttpGet]
        public IActionResult Upload()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Upload(IFormFile file)
        {
            if (file == null)
                return HttpBadRequest("There is no file.");
            var header = ContentDispositionHeaderValue.Parse(file.ContentDisposition);
            var fileNameWithExt = header.FileName.Trim('"');
            var fileName = Path.GetFileNameWithoutExtension(fileNameWithExt);
            var ext = Path.GetExtension(fileNameWithExt);
            var targetDir = Path.Combine(ApplicationEnvironment.ApplicationBasePath, "wwwroot\\uploads");

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
                file.SaveAs(Path.Combine(targetDir, fileNameWithExt));

            return Content("http://" + Request.Host + "/uploads/" + Uri.EscapeDataString(fileNameWithExt));
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
