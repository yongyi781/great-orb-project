using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace GOP.Hubs
{
    public class MultiplayerHub : Hub
    {
        public MultiplayerHub(MultiplayerManager manager, ILogger<MultiplayerHub> logger)
        {
            MultiplayerManager = manager;
            Logger = logger;
        }

        public MultiplayerManager MultiplayerManager { get; set; }
        public ILogger<MultiplayerHub> Logger { get; set; }

        public override async Task OnConnected()
        {
            await MultiplayerManager.AddPlayer(Context);
            await base.OnConnected();
        }

        public override async Task OnReconnected()
        {
            await MultiplayerManager.AddPlayer(Context);
            await base.OnReconnected();
        }

        public override async Task OnDisconnected(bool stopCalled)
        {
            await MultiplayerManager.RemovePlayer(Context);
            await base.OnDisconnected(stopCalled);
        }

        public Task AddCurrentPlayer()
        {
            return  MultiplayerManager.AddPlayer(Context);
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
            return Clients.All.NotifySaved();
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
