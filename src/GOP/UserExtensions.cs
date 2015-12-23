using System.Security.Claims;

namespace GOP
{
    public static class UserExtensions
    {
        public static int? GetUserIdInt32(this ClaimsPrincipal user)
        {
            string id = user.GetUserId();
            return id == null ? null : (int?)int.Parse(id);
        }
    }
}
