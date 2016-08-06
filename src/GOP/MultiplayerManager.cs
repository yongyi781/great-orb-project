using GOP.Hubs;
using GOP.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Hubs;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace GOP
{
    public class MultiplayerManager
    {
        public const int TicksPerAltar = 199;
        public const int TickLength = 600;
        public readonly Point[] DefaultStartingLocations =
        {
            new Point(2, 0),
            new Point(-2, 0),
            new Point(0,-2),
            new Point(0, 2),
            new Point(2, -2)
        };

        private readonly Timer timer;
        private readonly object playersLock = new object();
        private const int CountdownLength = 5;
        private const string PlayingGroup = "Playing";
        private const string WaitlistGroup = "Waitlist";

        private readonly List<Player> players = new List<Player>();

        public MultiplayerManager(ApplicationDbContext dbContext, IHubContext<MultiplayerHub> hubContext)
        {
            DbContext = dbContext;
            HubContext = hubContext;
            timer = new Timer(Tick, null, Timeout.Infinite, TickLength);
        }

        public ApplicationDbContext DbContext { get; set; }
        public IHubContext<MultiplayerHub> HubContext { get; set; }

        public IHubConnectionContext<dynamic> Clients { get { return HubContext.Clients; } }
        public IGroupManager Groups { get { return HubContext.Groups; } }
        public dynamic PlayingClients { get { return Clients.Group(PlayingGroup); } }

        public bool IsGameRunning { get; set; }
        public bool HasSaved { get; set; }
        public int CurrentTick { get; set; } = -CountdownLength;
        public int Altar { get; set; } = 1;
        public int Seed { get; set; } = 5489;

        public void AddPlayer(HubCallerContext context)
        {
            var httpContext = context.Request.HttpContext;
            if (IsGameRunning)
            {
                Clients.Client(context.ConnectionId).Reject(players);
                Groups.Remove(context.ConnectionId, PlayingGroup);
                Groups.Add(context.ConnectionId, WaitlistGroup);
            }
            else
            {
                Groups.Remove(context.ConnectionId, WaitlistGroup);
                Groups.Add(context.ConnectionId, PlayingGroup);
                lock (playersLock)
                {
                    players.Add(new Player
                    {
                        ConnectionId = context.ConnectionId,
                        IpAddress = httpContext.Connection.RemoteIpAddress.ToString(),
                        Username = DbContext.GetUsername(GopUser.GetCurrentUser(httpContext)),
                        Run = true,
                        IsWatching = true,
                        StartLocation = DefaultStartingLocations[Math.Min(DefaultStartingLocations.Length - 1, players.Count)]
                    });
                }
                Clients.Client(context.ConnectionId).SetGameParams(Altar, Seed);
                PlayingClients.UpdatePlayers(players, true);
                for (int i = 0; i < players.Count; ++i)
                {
                    Clients.Client(players[i].ConnectionId).SetPlayerIndex(i);
                }
            }
        }

        public void RemovePlayer(HubCallerContext context)
        {
            lock (playersLock)
            {
                var playerIndex = players.FindIndex(p => p.ConnectionId == context.ConnectionId);
                if (playerIndex >= 0)
                {
                    players.RemoveAt(playerIndex);
                    PlayingClients.RemovePlayer(playerIndex);
                    for (int i = 0; i < players.Count; ++i)
                    {
                        Clients.Client(players[i].ConnectionId).SetPlayerIndex(i);
                    }
                }
                if (players.Count(p => !p.IsWatching) == 0)
                {
                    // No more players, restart the whole thing.
                    SendNewGameSignal();
                }
            }
        }

        public void SendStartSignal(HubCallerContext context)
        {
            var player = GetPlayer(context);
            if (player != null)
                player.StartRequested = true;
            if (players.Where(p => !p.IsWatching).All(p => p.StartRequested))
            {
                timer.Change(0, TickLength);
                IsGameRunning = true;
            }
            PlayingClients.UpdatePlayers(players, false);
        }

        public void SendNewGameSignal()
        {
            if (IsGameRunning)
                StopGame();
            HasSaved = false;
            Clients.Group(WaitlistGroup).NotifyRejoin();

            foreach (var p in players)
            {
                p.StartRequested = false;
            }
            PlayingClients.UpdatePlayers(players, false);
            PlayingClients.NewGame();
        }

        public void SendAction(HubCallerContext context, string action)
        {
            var player = GetPlayer(context);
            if (player != null && !(player.IsWatching && IsAttractOrbAction(action)))
                player.Action = action;
            PlayingClients.UpdatePlayers(players, false);
        }

        public void SendRun(HubCallerContext context, bool run)
        {
            var player = GetPlayer(context);
            if (player != null)
                player.Run = run;
        }

        public void SendRepel(HubCallerContext context, bool repel)
        {
            var player = GetPlayer(context);
            if (player != null)
                player.Repel = repel;
        }

        public void SetPlayerLocation(HubCallerContext context, int x, int y)
        {
            var player = players.Find(p => p.ConnectionId == context.ConnectionId);
            if (player != null)
            {
                player.StartLocation = new Point(x, y);
                PlayingClients.UpdatePlayers(players, false);
            }
        }

        public void SetGameParams(int altar, int seed)
        {
            Altar = altar;
            Seed = seed;
            PlayingClients.SetGameParams(altar, seed);
        }

        public void SetWatching(HubCallerContext context, bool watching)
        {
            var player = GetPlayer(context);
            if (player != null)
            {
                player.IsWatching = watching;
                if (watching)
                {
                    // Clear player's action if watching.
                    player.Action = null;
                }
            }
            PlayingClients.UpdatePlayers(players, false);
        }
        
        private Player GetPlayer(HubCallerContext context)
        {
            return players.FirstOrDefault(p => p.ConnectionId == context.ConnectionId);
        }

        private void Tick(object state)
        {
            ++CurrentTick;
            if (CurrentTick <= 0)
            {
                PlayingClients.SetCountdown(-CurrentTick + 1);
            }
            else if (CurrentTick <= TicksPerAltar)
            {
                PlayingClients.Tick(players, CurrentTick);

                foreach (var p in players)
                {
                    p.Action = null;
                }
            }

            if (CurrentTick >= TicksPerAltar)
            {
                // Game is over
                StopGame(false);
            }
        }

        private void StopGame(bool callClientStop = true)
        {
            timer.Change(Timeout.Infinite, TickLength);
            CurrentTick = -CountdownLength;
            IsGameRunning = false;
            if (callClientStop)
            {
                PlayingClients.Stop();
            }
        }

        private bool IsAttractOrbAction(string action)
        {
            return char.IsLetter(action[action.Length - 1]);
        }

        public class Player
        {
            public string ConnectionId { get; set; }

            public string IpAddress { get; set; }

            [JsonProperty("username")]
            public string Username { get; set; }

            [JsonProperty("startRequested")]
            public bool StartRequested { get; set; }

            [JsonProperty("action")]
            public string Action { get; set; }
            [JsonProperty("run")]
            public bool Run { get; set; }
            [JsonProperty("repel")]
            public bool Repel { get; set; }
            [JsonProperty("isWatching")]
            public bool IsWatching { get; set; }
            [JsonProperty("startLocation")]
            public Point StartLocation { get; set; }
        }

        public struct Point
        {
            public Point(int x, int y) { X = x; Y = y; }

            [JsonProperty("x")]
            public int X { get; set; }
            [JsonProperty("y")]
            public int Y { get; set; }
        }
    }
}
