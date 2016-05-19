using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace GOP
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var url = args.Length > 0 ? args[0] : "http://localhost:5001";
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseUrls(url)
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}
