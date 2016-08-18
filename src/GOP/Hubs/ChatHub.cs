using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GOP.Hubs
{
    public class ChatHub : Hub
    {
        private IServiceScopeFactory serviceScopeFactory;

        public ChatHub(IServiceScopeFactory serviceScopeFactory)
        {
            this.serviceScopeFactory = serviceScopeFactory;
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

        public override Task OnConnected()
        {
            ConnectedUsers[Context.ConnectionId] = ChatUser.GetCurrentUserNow(Context.Request.HttpContext);
            BroadcastOnlineUsers();
            return base.OnConnected();
        }

        public override Task OnReconnected()
        {
            ConnectedUsers[Context.ConnectionId] = ChatUser.GetCurrentUserNow(Context.Request.HttpContext);
            BroadcastOnlineUsers();
            return base.OnReconnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            ChatUser user;
            ConnectedUsers.TryRemove(Context.ConnectionId, out user);
            BroadcastOnlineUsers();
            return base.OnDisconnected(stopCalled);
        }

        private void BroadcastOnlineUsers()
        {
            using (var scope = serviceScopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var users = UniqueOnlineUsers.Select(u => db.GetChatUserOnlineView(u));
                Clients.All.UpdateOnlineUsers(users);
            }
        }
    }
}
