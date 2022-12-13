using GOP;
using GOP.Hubs;
using GOP.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

//namespace GOP
//{
//    public class Program
//    {
//        public static void Main(string[] args)
//        {
//            BuildWebHost(args).Run();
//        }

//        public static IWebHost BuildWebHost(string[] args) =>
//            WebHost.CreateDefaultBuilder(args)
//                .UseUrls("http://+:80", "https://+:443")
//                .UseStartup<Startup>()
//                .Build();
//    }
//}

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://+:80", "https://+:443");

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
    options.User.AllowedUserNameCharacters += " ";
})
    .AddUserStore<UserStore<ApplicationUser, IdentityRole<int>, ApplicationDbContext, int>>()
    .AddRoleStore<RoleStore<IdentityRole<int>, ApplicationDbContext, int>>()
    .AddDefaultTokenProviders();
builder.Services.AddAuthentication().AddFacebook(o =>
{
    o.AppId = builder.Configuration["Authentication:Facebook:AppId"];
    o.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"];
});
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();
builder.Services.AddLogging();
builder.Services.AddResponseCompression();

// Add my own services.
builder.Services.AddSingleton<Random>();
builder.Services.AddSingleton<KickCounter>();
//builder.Services.AddScoped<MultiplayerManager>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseStatusCodePagesWithReExecute("/Home/Error/{0}");
    app.UseExceptionHandler("/Home/Error/500");
}

app.UseHttpsRedirection();
app.UseResponseCompression();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<RequestLoggerMiddleware>();
app.UseStaticFiles(new StaticFileOptions { ServeUnknownFileTypes = true });
app.UseWebSockets();

app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<MultiplayerHub>("/hubs/multiplayer");

app.MapControllerRoute(
    name: "areaRoute",
    pattern: "{area:exists}/{action=Index}",
    defaults: new { controller = "Home" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.UseFileServer(true);

app.Run();

