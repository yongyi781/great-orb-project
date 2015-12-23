using System.Security.Claims;

namespace GOP
{
    public static class UserExtensions
    {
        public static int? GetUserIdInt32(this ClaimsPrincipal user)
        {
            string idStr = user.GetUserId();
            int id;
            if (idStr != null && int.TryParse(idStr, out id))
                return id;
            return null;
        }
    }
}
