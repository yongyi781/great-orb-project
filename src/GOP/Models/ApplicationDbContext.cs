using GOP.ViewModels;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace GOP.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public const string DefaultChatColor = "white";

        public DateTimeOffset CreationTime = DateTimeOffset.Now;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public bool CacheViewUsers { get; set; }

        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Nickname> Nicknames { get; set; }
        public DbSet<CustomAltar> CustomAltars { get; set; }
        public DbSet<SoloGame> SoloGames { get; set; }
        public DbSet<MultiplayerGame> MultiplayerGames { get; set; }
        public DbSet<Puzzle> Puzzles { get; set; }
        public DbSet<PuzzleSubmission> PuzzleSubmissions { get; set; }
        public DbSet<DeadPracticeResult> DeadPracticeResults { get; set; }

        private Dictionary<string, ChatMessageViewUser> ipAddressToViewUserCache = new Dictionary<string, ChatMessageViewUser>();
        private Dictionary<int, ChatMessageViewUser> userIdToViewUserCache = new Dictionary<int, ChatMessageViewUser>();

        public ChatMessageView GetChatMessageView(ChatMessage message) => new ChatMessageView
        {
            Id = message.Id,
            Timestamp = message.Timestamp,
            User = GetChatMessageViewUser(new GopUser(message.UserId, message.IpAddress)),
            Text = Utilities.FormatChatMessage(message.Text)
        };

        public ChatMessageViewUser GetChatMessageViewUser(GopUser user)
        {
            ChatMessageViewUser viewUser;

            if (user.UserId != null)
            {
                if (CacheViewUsers && userIdToViewUserCache.TryGetValue(user.UserId.Value, out viewUser))
                    return viewUser;

                var loggedInUser = Users.AsNoTracking()
                    .Where(u => u.Id == user.UserId)
                    .Select(u => new { u.UserName, u.ChatColor })
                    .Single();
                viewUser = new ChatMessageViewUser
                {
                    Username = loggedInUser.UserName,
                    ChatColor = loggedInUser.ChatColor,
                    LoggedIn = true
                };

                userIdToViewUserCache[user.UserId.Value] = viewUser;
            }
            else
            {
                if (CacheViewUsers)
                {
                    if (ipAddressToViewUserCache.TryGetValue(user.IpAddress, out viewUser))
                        return viewUser;
                    return new ChatMessageViewUser
                    {
                        Username = user.IpAddress,
                        ChatColor = DefaultChatColor,
                        LoggedIn = false
                    };
                }

                viewUser = new ChatMessageViewUser
                {
                    Username = GetNameForIpAddress(user.IpAddress),
                    ChatColor = DefaultChatColor,
                    LoggedIn = false
                };
                ipAddressToViewUserCache[user.IpAddress] = viewUser;
            }

            return viewUser;
        }

        public ChatUserOnlineView GetChatUserOnlineView(ChatUser chatUser)
        {
            var chatViewUser = GetChatMessageViewUser(chatUser.GopUser);
            return new ChatUserOnlineView
            {
                Username = chatViewUser.Username,
                ChatColor = chatViewUser.ChatColor,
                LoggedIn = chatViewUser.LoggedIn,
                IsMobile = chatUser.IsMobile
            };
        }

        public string GetUsername(GopUser user) => GetChatMessageViewUser(user).Username;

        public string GetChatColor(GopUser user) => GetChatMessageViewUser(user).ChatColor;

        /// <summary>
        /// Loads the entire table of users and nicknames into the cache.
        /// </summary>
        public void LoadUsersIntoCache()
        {
            ipAddressToViewUserCache = Nicknames.AsNoTracking().ToDictionary(n => n.IpAddress, n => new ChatMessageViewUser
            {
                Username = n.Name,
                ChatColor = DefaultChatColor,
                LoggedIn = false
            });
            userIdToViewUserCache = Users.AsNoTracking().ToDictionary(u => u.Id, u => new ChatMessageViewUser
            {
                Username = u.UserName,
                ChatColor = u.ChatColor,
                LoggedIn = true
            });
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);
            builder.Entity<ChatMessage>(b =>
            {
                b.Property(e => e.IpAddress).HasColumnType("varchar(50)");
            });
            builder.Entity<Nickname>(b =>
            {
                b.HasKey(e => e.IpAddress);
                b.Property(e => e.IpAddress).HasColumnType("varchar(50)");
            });
        }

        private string GetNameForIpAddress(string ipAddress) =>
            Nicknames.AsNoTracking().FirstOrDefault(n => n.IpAddress == ipAddress)?.Name ?? ipAddress;
    }
}
