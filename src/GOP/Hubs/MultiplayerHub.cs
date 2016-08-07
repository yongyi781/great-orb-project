using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
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

        public override Task OnConnected()
        {
            MultiplayerManager.AddPlayer(Context);
            return base.OnConnected();
        }

        public override Task OnReconnected()
        {
            MultiplayerManager.AddPlayer(Context);
            return base.OnReconnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            MultiplayerManager.RemovePlayer(Context);
            return base.OnDisconnected(stopCalled);
        }

        public void AddCurrentPlayer()
        {
            MultiplayerManager.AddPlayer(Context);
        }

        public void SetReady(bool ready)
        {
            MultiplayerManager.SetReady(Context, ready);
        }
        
        public void SendNewGameSignal()
        {
            MultiplayerManager.SendNewGameSignal();
        }

        public void SendAction(string action)
        {
            MultiplayerManager.SendAction(Context, action);
        }

        public void SendRun(bool run)
        {
            MultiplayerManager.SendRun(Context, run);
        }

        public void SendRepel(bool repel)
        {
            MultiplayerManager.SendRepel(Context, repel);
        }

        public void SetPlayerLocation(int x, int y)
        {
            MultiplayerManager.SetPlayerLocation(Context, x, y);
        }

        public void SetGameParams(int altar, int seed)
        {
            MultiplayerManager.SetGameParams(altar, seed);
        }

        public void SetWatching(bool watching)
        {
            MultiplayerManager.SetWatching(Context, watching);
        }

        public void NotifySaved()
        {
            Clients.All.NotifySaved();
        }

        public void Rewind(int ticks)
        {
            MultiplayerManager.CurrentTick = Math.Max(0, MultiplayerManager.CurrentTick - ticks);
            Clients.All.RewindTo(MultiplayerManager.CurrentTick);
        }

        public void FastForward(int ticks)
        {
            MultiplayerManager.CurrentTick = Math.Min(MultiplayerManager.TicksPerAltar, MultiplayerManager.CurrentTick + ticks);
            Clients.All.FastForwardTo(MultiplayerManager.CurrentTick);
        }
    }
}
