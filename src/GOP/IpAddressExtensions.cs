using System.Net;

namespace GOP
{
    public static class IpAddressExtensions
    {
        public static string ToShortString(this IPAddress ipAddress)
        {
            if (ipAddress.IsIPv4MappedToIPv6)
                return ipAddress.MapToIPv4().ToString();
            return ipAddress.ToString();
        }
    }
}
