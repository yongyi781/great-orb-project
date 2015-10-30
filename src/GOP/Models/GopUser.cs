using Microsoft.AspNet.Http;
using System;

namespace GOP.Models
{
    /// <summary>
    /// Represents the concept of a "user" in this website.
    /// Users are either identified by logged in user ID, or by IP address.
    /// </summary>
    public class GopUser : IEquatable<GopUser>
    {
        public GopUser(int? userId, string ipAddress)
        {
            UserId = userId;
            IpAddress = ipAddress;
        }

        public int? UserId { get; private set; }
        public string IpAddress { get; private set; }

        public static GopUser GetCurrentUser(HttpContext context)
        {
            return context == null ? null : new GopUser(context.User.GetUserIdInt32(), context.Connection.RemoteIpAddress.ToString());
        }

        public static bool IsCurrentUser(int? userId, string ipAddress, HttpContext context)
        {
            return new GopUser(userId, ipAddress).Equals(GetCurrentUser(context));
        }

        /// <summary>
        /// Returns whether this GopUser is the same as another GopUser.
        /// Two GopUsers are the same if and only if:
        /// - they have the same non-null user ID
        /// - they are both not logged in and have the same IP address.
        /// </summary>
        /// <param name="other">The other GopUser.</param>
        /// <returns>true if this equals other; otherwise, false.</returns>
        public bool Equals(GopUser other)
        {
            if (UserId != null && other.UserId != null)
                return UserId == other.UserId;
            if (UserId == null && other.UserId == null)
                return IpAddress == other.IpAddress;
            return false;
        }

        public override bool Equals(object obj)
        {
            var gopUser = obj as GopUser;
            return gopUser != null && Equals(gopUser);
        }

        public override int GetHashCode()
        {
            return UserId != null ? UserId.GetHashCode() : IpAddress.GetHashCode();
        }
    }
}
