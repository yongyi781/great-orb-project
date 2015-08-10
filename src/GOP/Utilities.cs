using System;
using System.Linq;
using System.Net;

namespace GOP
{
    public class Utilities
    {
        public static readonly string[] AltarNames = { "None", "Air", "Mind", "Water", "Earth", "Fire", "Body" };

        public static string FormatChatMessage(string message)
        {
            var elements = message.Split(' ');
            for (int i = 0; i < elements.Length; ++i)
            {
                Uri uri;
                if (Uri.TryCreate(elements[i], UriKind.Absolute, out uri) && new string[] { "http", "https", "ftp" }.Any(s => uri.Scheme.Equals(s)))
                {
                    elements[i] = string.Format("<a href=\"{0}\" target=\"_blank\">{1}</a>", elements[i], uri);
                }
                else
                {
                    elements[i] = WebUtility.HtmlEncode(elements[i]);
                }
            }
            return string.Join(" ", elements);
        }

        public static string FormatValue(double? value, string format)
        {
            return value == null ? null : value.Value.ToString(format);
        }
    }
}
