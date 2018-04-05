using GOP.Hubs;
using GOP.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;

namespace GOP
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            // Setup configuration sources.
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddUserSecrets<Startup>();
            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add EF services to the services container.
            services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

            // Add Identity services to the services container.
            services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
            {
                options.User.AllowedUserNameCharacters += " ";
            })
                .AddUserStore<UserStore<ApplicationUser, IdentityRole<int>, ApplicationDbContext, int>>()
                .AddRoleStore<RoleStore<IdentityRole<int>, ApplicationDbContext, int>>()
                .AddDefaultTokenProviders();

            services.AddAuthentication().AddFacebook(options =>
            {
                options.AppId = Configuration["Authentication:Facebook:AppId"];
                options.AppSecret = Configuration["Authentication:Facebook:AppSecret"];
            });

            // Configure the options for the authentication middleware.
            // You can add options for Google, Twitter and other middleware as shown below.
            // For more information see http://go.microsoft.com/fwlink/?LinkID=532715
            services.AddSignalR();

            services.AddLogging();

            // Add MVC services to the services container.
            services.AddMvc();

            services.AddResponseCompression();

            // Add my own services.
            services.AddSingleton<Random>();
            services.AddSingleton<KickCounter>();
            services.AddSingleton<MultiplayerManager>();
        }

        // Configure is called after ConfigureServices is called.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            app.UseStatusCodePagesWithReExecute("/Home/Error/{0}");
            // Add the following to the request pipeline only in development environment.
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                // Add Error handling middleware which catches all application specific errors and
                // sends the request to the following path or controller action.
                app.UseExceptionHandler("/Home/Error/500");
            }

            app.UseResponseCompression();

            // Add cookie-based authentication to the request pipeline.
            app.UseAuthentication();

            app.UseMiddleware<RequestLoggerMiddleware>();

            app.UseStaticFiles(new StaticFileOptions { ServeUnknownFileTypes = true });
            app.UseWebSockets();
            app.UseSignalR(routes =>
            {
                routes.MapHub<ChatHub>("/hubs/chat");
                routes.MapHub<MultiplayerHub>("/hubs/multiplayer");
            });

            // Add MVC to the request pipeline.
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "areaRoute",
                    template: "{area:exists}/{action=Index}",
                    defaults: new { controller = "Home" });

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });

            app.UseFileServer(true);
        }
    }
}
