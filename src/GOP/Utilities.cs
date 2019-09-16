using GOP.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;

namespace GOP
{
    public class Utilities
    {
        public const int NumberOfAltars = 6;
        public const string NicknameCookieName = "Nickname";
        public static readonly string[] AltarNames = { "None", "Air", "Mind", "Water", "Earth", "Fire", "Body" };

        public static string FormatChatMessage(string message)
        {
            return HtmlEncoder.Default.Encode(message);
        }

        public static string FormatValue(double? value, string format)
        {
            return value == null ? null : value.Value.ToString(format);
        }

        // Returns if two streams are equal.
        public static bool StreamCompare(Stream stream1, Stream stream2)
        {
            const int bufferSize = 2048 * 2;
            var buffer1 = new byte[bufferSize];
            var buffer2 = new byte[bufferSize];

            while (true)
            {
                int count1 = stream1.Read(buffer1, 0, bufferSize);
                int count2 = stream2.Read(buffer2, 0, bufferSize);

                if (count1 != count2)
                {
                    return false;
                }

                if (count1 == 0)
                {
                    return true;
                }

                int iterations = (int)Math.Ceiling((double)count1 / sizeof(Int64));
                for (int i = 0; i < iterations; i++)
                {
                    if (BitConverter.ToInt64(buffer1, i * sizeof(Int64)) != BitConverter.ToInt64(buffer2, i * sizeof(Int64)))
                    {
                        return false;
                    }
                }
            }
        }

        public static void UpdateNickname(HttpContext context, ApplicationDbContext dbContext, string desiredName)
        {
            if (Regex.IsMatch(desiredName, @"\$\$|[^A-zÀ-ÿ0-9 $\\{}^_-]") || desiredName.Count(c => c == '$') % 2 != 0)
                throw new InvalidOperationException("Invalid nickname.");
            if (desiredName.Length > 50)
                throw new InvalidOperationException("Nickname cannot be more than 50 characters long.");

            context.Response.Cookies.Append(NicknameCookieName, desiredName);
            var ipAddress = context.Connection.RemoteIpAddress.ToShortString();
            var nick = dbContext.Nicknames.Find(ipAddress);
            if (nick != null)
            {
                nick.Name = desiredName;
                nick.LastChanged = DateTimeOffset.Now;
            }
            else
            {
                dbContext.Nicknames.Add(new Nickname
                {
                    IpAddress = ipAddress,
                    Name = desiredName,
                    LastChanged = DateTimeOffset.Now
                });
            }
            dbContext.SaveChanges(true);
        }

        public static void ClearNickname(HttpContext context, ApplicationDbContext dbContext)
        {
            context.Response.Cookies.Delete(NicknameCookieName);
            var ipAddress = context.Connection.RemoteIpAddress.ToShortString();
            var nick = dbContext.Nicknames.Find(ipAddress);
            if (nick != null)
            {
                dbContext.Nicknames.Remove(nick);
                dbContext.SaveChanges();
            }
        }
    }
}
