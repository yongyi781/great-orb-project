using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GOP.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IHttpContextAccessor httpContextAccessor;

        public ChatHub(ApplicationDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            this.dbContext = dbContext;
            this.httpContextAccessor = httpContextAccessor;
        }

        public static ConcurrentDictionary<string, ChatUser> ConnectedUsers { get; } = new ConcurrentDictionary<string, ChatUser>();
        public static IEnumerable<ChatUser> UniqueOnlineUsers => ConnectedUsers.Values
            .OrderBy(user => user.ConnectionTime)
            .GroupBy(user => user.GopUser)
            .Select(g => new ChatUser
            {
                GopUser = g.First().GopUser,
                ConnectionTime = g.First().ConnectionTime,
                IsMobile = g.Any(u => u.IsMobile)
            });

        public override Task OnConnectedAsync()
        {
            ConnectedUsers[Context.ConnectionId] = ChatUser.GetCurrentUserNow(httpContextAccessor.HttpContext);
            BroadcastOnlineUsers();
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            ChatUser user;
            ConnectedUsers.TryRemove(Context.ConnectionId, out user);
            BroadcastOnlineUsers();
            return base.OnDisconnectedAsync(exception);
        }

        private void BroadcastOnlineUsers()
        {
            var users = UniqueOnlineUsers.Select(u => dbContext.GetChatUserOnlineView(u));
            Clients.All.InvokeAsync("UpdateOnlineUsers", users);
        }
    }
}
