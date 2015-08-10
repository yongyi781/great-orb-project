using GOP.Models;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Diagnostics.Entity;
using Microsoft.AspNet.Hosting;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Data.Entity;
using Microsoft.Dnx.Runtime;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Logging;

namespace GOP
{
    public class Startup
    {
        public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv)
        {
            // Setup configuration sources.
            var builder = new ConfigurationBuilder(appEnv.ApplicationBasePath)
                .AddJsonFile("config.json")
                .AddJsonFile($"config.{env.EnvironmentName}.json", optional: true)
                .AddUserSecrets();
            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add Application settings to the services container.
            services.Configure<AppSettings>(Configuration.GetConfigurationSection("AppSettings"));

            // Add EF services to the services container.
            services.AddEntityFramework()
                .AddSqlServer()
                .AddDbContext<ApplicationDbContext>(options =>
                    options.UseSqlServer(Configuration["Data:DefaultConnection:ConnectionString"]));

            // Add Identity services to the services container.
            services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
            {
                options.User.AllowedUserNameCharacters += " ";
            })
                .AddEntityFrameworkStores<ApplicationDbContext, int>()
                .AddDefaultTokenProviders();

            // Configure the options for the authentication middleware.
            // You can add options for Google, Twitter and other middleware as shown below.
            // For more information see http://go.microsoft.com/fwlink/?LinkID=532715
            services.ConfigureFacebookAuthentication(options =>
            {
                options.AppId = Configuration["Authentication:Facebook:AppId"];
                options.AppSecret = Configuration["Authentication:Facebook:AppSecret"];
            });

            services.AddSignalR(options =>
            {
                options.Hubs.EnableDetailedErrors = true;
            });
            
            // Add MVC services to the services container.
            services.AddMvc();
        }

        // Configure is called after ConfigureServices is called.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerfactory)
        {
            // Add the console logger.
            loggerfactory.AddConsole(LogLevel.Information);

            //app.UseStatusCodePages();
            // Add the following to the request pipeline only in development environment.
            if (env.IsEnvironment("Development"))
            {
                app.UseErrorPage();
                app.UseDatabaseErrorPage(DatabaseErrorPageOptions.ShowAll);
            }
            else
            {
                // Add Error handling middleware which catches all application specific errors and
                // sends the request to the following path or controller action.
                app.UseStatusCodePages();
            }

            // Add cookie-based authentication to the request pipeline.
            app.UseIdentity();
            app.UseFacebookAuthentication();
            app.UseSignalR();

            // Don't use static files on IIS -- throws error.
            //app.UseStaticFiles();

            // Add MVC to the request pipeline.
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "areaRoute",
                    template: "{area:exists}/{action}",
                    defaults: new { controller = "Home", action = "Index" });

                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action}/{id?}",
                    defaults: new { controller = "Home", action = "Index" });
            });
        }
    }
}
