using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

namespace GOP
{
    public class RequestLoggerMiddleware
    {
        private const string LogFileName = "requests";

        private readonly RequestDelegate next;
        private readonly ILogger logger;
        private readonly StreamWriter writer;

        public RequestLoggerMiddleware(RequestDelegate next, ILogger<RequestLoggerMiddleware> logger)
        {
            this.next = next;
            this.logger = logger;

            // Try opening request.log, then request1.log, then request2.log, etc.
            // If all failed, then oh well. Can't log requests I guess.
            for (int i = 0; i < 100; i++)
            {
                string fileName = LogFileName + (i > 0 ? i.ToString() : "") + ".log";
                try
                {
                    writer = new StreamWriter(fileName, true);
                }
                catch (IOException)
                {
                    continue;
                }
                writer.AutoFlush = true;
                // New line in case the previous instance didn't shut down cleanly.
                writer.WriteLine();
                break;
            }
        }

        public async Task Invoke(HttpContext context)
        {
            if (writer == null)
                return;

            var localIp = FormatForLog(context.Connection.LocalIpAddress.ToString());
            var method = FormatForLog(context.Request.Method);
            var url = FormatForLog(context.Request.Path.ToString());
            var queryString = FormatForLog(context.Request.QueryString.ToString());
            var port = FormatForLog(context.Connection.LocalPort.ToString());
            var username = FormatForLog(context.User.Identity.Name);
            var remoteIp = FormatForLog(context.Connection.RemoteIpAddress.ToString());
            var userAgent = FormatForLog(context.Request.Headers["User-Agent"]);
            var referer = FormatForLog(context.Request.Headers["Referer"]);

            await next(context);

            var statusCode = context.Response.StatusCode;
            var str = $"{DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")} {localIp} {method} {url} {queryString} {port} {username} {remoteIp} {userAgent} {referer} {statusCode}";
            logger.LogDebug(str);
            writer.WriteLine(str);
        }

        private string FormatForLog(string str)
        {
            if (string.IsNullOrEmpty(str))
                return "-";
            if (str.Contains(" "))
                return "\"" + str + "\"";
            return str;
        }
    }
}
