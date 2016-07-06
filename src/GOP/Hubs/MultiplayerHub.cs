﻿using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace GOP.Hubs
{
    public class MultiplayerHub : Hub
    {
        public MultiplayerManager MultiplayerManager { get; set; }
        
        public override Task OnConnected()
        {
            AddPlayer();
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            MultiplayerManager.RemovePlayer(Context);
            return base.OnDisconnected(stopCalled);
        }

        public void AddPlayer()
        {
            MultiplayerManager.AddPlayer(Context);
        }

        public void SendStartSignal()
        {
            MultiplayerManager.SendStartSignal(Context);
        }

        public void SendStopSignal(bool stopClients)
        {
            MultiplayerManager.SendStopSignal(Context, stopClients);
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
            MultiplayerManager.SetGameParams(Context, altar, seed);
        }

        public void SetWatching(bool watching)
        {
            MultiplayerManager.SetWatching(Context, watching);
        }

        // Saving
        public void SendSaveRequest(string code, int score)
        {
            MultiplayerManager.SendSaveRequest(Context, code, score);
        }

        public void SendMinusTicks()
        {
            Clients.All.ReceiveMinusTicks();
        }

        public void SendPlusTicks()
        {
            Clients.All.ReceivePlusTicks();
        }
    }
}