using System;
using System.IO;
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
    }
}
