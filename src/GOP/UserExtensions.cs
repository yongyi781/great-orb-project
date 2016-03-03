using GOP.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace GOP
{
    public static class UserExtensions
    {
        public static int? GetUserIdInt32(this UserManager<ApplicationUser> userManager, ClaimsPrincipal user)
        {
            string idStr = userManager.GetUserId(user);
            int id;
            if (idStr != null && int.TryParse(idStr, out id))
                return id;
            return null;
        }

        public static int? GetUserIdInt32(this ClaimsPrincipal user)
        {
            string idStr = user.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            int id;
            if (idStr != null && int.TryParse(idStr, out id))
                return id;
            return null;
        }
    }
}
