using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GOP.Models;
using GOP.ViewModels;

namespace GOP.Controllers
{
    [Authorize]
    public class ManageController : Controller
    {
        public ManageController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public UserManager<ApplicationUser> UserManager { get; private set; }

        public SignInManager<ApplicationUser> SignInManager { get; private set; }

        //
        // GET: /Account/Index
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var user = await GetCurrentUserAsync();
            var model = new IndexViewModel
            {
                ChatColor = user.ChatColor
            };
            return View(model);
        }
        
        private async Task<ApplicationUser> GetCurrentUserAsync()
        {
            return await UserManager.FindByIdAsync(UserManager.GetUserId(HttpContext.User));
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }
    }
}
