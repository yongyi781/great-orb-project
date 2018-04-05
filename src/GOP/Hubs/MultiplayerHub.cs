using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace GOP.Hubs
{
    public class MultiplayerHub : Hub
    {
        private readonly IHttpContextAccessor httpContextAccessor;

        public MultiplayerHub(MultiplayerManager manager, ILogger<MultiplayerHub> logger, IHttpContextAccessor httpContextAccessor)
        {
            MultiplayerManager = manager;
            Logger = logger;
            this.httpContextAccessor = httpContextAccessor;
        }

        public MultiplayerManager MultiplayerManager { get; set; }
        public ILogger<MultiplayerHub> Logger { get; set; }

        public override async Task OnConnectedAsync()
        {
            await MultiplayerManager.AddPlayer(Context, Groups, httpContextAccessor.HttpContext);
            await base.OnConnectedAsync();
        }
        
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await MultiplayerManager.RemovePlayer(Context);
            await base.OnDisconnectedAsync(exception);
        }

        public Task AddCurrentPlayer()
        {
            return  MultiplayerManager.AddPlayer(Context, Groups, httpContextAccessor.HttpContext);
        }

        public Task SetReady(bool ready)
        {
            return MultiplayerManager.SetReady(Context, ready);
        }
        
        public Task SendNewGameSignal()
        {
            return MultiplayerManager.SendNewGameSignal();
        }

        public Task SendAction(string action)
        {
            return MultiplayerManager.SendAction(Context, action);
        }

        public void SendRun(bool run)
        {
            MultiplayerManager.SendRun(Context, run);
        }

        public void SendRepel(bool repel)
        {
            MultiplayerManager.SendRepel(Context, repel);
        }

        public Task SetPlayerLocation(int x, int y)
        {
            return MultiplayerManager.SetPlayerLocation(Context, x, y);
        }

        public Task SetGameParams(int altar, int seed)
        {
            return MultiplayerManager.SetGameParams(altar, seed);
        }

        public Task SetWatching(bool watching)
        {
            return MultiplayerManager.SetWatching(Context, watching);
        }

        public Task NotifySaved()
        {
            return Clients.All.SendAsync("NotifySaved");
        }

        public Task Rewind(int ticks)
        {
            return MultiplayerManager.Rewind(ticks);
        }

        public Task FastForward(int ticks)
        {
            return MultiplayerManager.FastForward(ticks);
        }
    }
}
