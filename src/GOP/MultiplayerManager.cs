using GOP.Hubs;
using GOP.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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

        public IHubClients Clients => HubContext.Clients;
        public dynamic PlayingClients { get { return Clients.Group(PlayingGroup); } }

        public Timer Timer { get { return timer; } }

        public bool IsGameRunning { get; set; }
        public bool HasSaved { get; set; }
        public int CurrentTick { get; set; } = -CountdownLength;
        public int Altar { get; set; } = 1;
        public int Seed { get; set; } = 5489;

        public async Task AddPlayer(HubCallerContext context, IGroupManager groups, HttpContext httpContext)
        {
            if (IsGameRunning)
            {
                await Clients.Client(context.ConnectionId).SendAsync("Reject", players);
                await groups.RemoveAsync(context.ConnectionId, PlayingGroup);
                await groups.AddAsync(context.ConnectionId, WaitlistGroup);
            }
            else if (players.TrueForAll(p => p.ConnectionId != context.ConnectionId))
            {
                await groups.RemoveAsync(context.ConnectionId, WaitlistGroup);
                await groups.AddAsync(context.ConnectionId, PlayingGroup);
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
                await Clients.Client(context.ConnectionId).SendAsync("SetGameParams", Altar, Seed);
                await PlayingClients.UpdatePlayers(players, true);
                await UpdatePlayerIndices();
            }
        }

        public async Task RemovePlayer(HubCallerContext context)
        {
            int playerIndex = -1;
            lock (playersLock)
            {
                playerIndex = players.FindIndex(p => p.ConnectionId == context.ConnectionId);
                if (playerIndex != -1)
                    players.RemoveAt(playerIndex);
            }

            if (playerIndex != -1)
            {
                await PlayingClients.RemovePlayer(playerIndex);
                await UpdatePlayerIndices();

                if (players.Count(p => !p.IsWatching) == 0)
                {
                    // No more players, restart the whole thing.
                    await SendNewGameSignal();
                }
            }
        }

        public async Task SetReady(HubCallerContext context, bool ready)
        {
            var player = GetPlayer(context);
            if (player != null)
                player.IsReady = ready;
            await PlayingClients.UpdatePlayers(players, false);
            StartGameIfReady();
        }

        public async Task SendNewGameSignal()
        {
            if (IsGameRunning)
                await StopGame();

            HasSaved = false;
            await Clients.Group(WaitlistGroup).SendAsync("NotifyRejoin");

            foreach (var p in players)
            {
                p.IsReady = false;
            }
            await PlayingClients.UpdatePlayers(players, false);
            await PlayingClients.NewGame();
        }

        public Task SendAction(HubCallerContext context, string action)
        {
            var player = GetPlayer(context);
            if (player != null && !(player.IsWatching && IsAttractOrbAction(action)))
                player.Action = action;
            return PlayingClients.UpdatePlayers(players, false);
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

        public async Task SetPlayerLocation(HubCallerContext context, int x, int y)
        {
            var player = players.Find(p => p.ConnectionId == context.ConnectionId);
            if (player != null)
            {
                player.StartLocation = new Point(x, y);
                await PlayingClients.UpdatePlayers(players, false);
            }
        }

        public Task SetGameParams(int altar, int seed)
        {
            Altar = altar;
            Seed = seed;
            return PlayingClients.SetGameParams(altar, seed);
        }

        public async Task SetWatching(HubCallerContext context, bool watching)
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
            await PlayingClients.UpdatePlayers(players, false);
            StartGameIfReady();
        }

        public Task Rewind(int ticks)
        {
            CurrentTick = Math.Max(0, CurrentTick - ticks);
            timer.Change(TickLength, TickLength);
            return Clients.All.SendAsync("RewindTo", CurrentTick);
        }

        public Task FastForward(int ticks)
        {
            CurrentTick = Math.Min(TicksPerAltar, CurrentTick + ticks);
            Timer.Change(TickLength, TickLength);
            return Clients.All.SendAsync("FastForwardTo", CurrentTick);
        }

        private Player GetPlayer(HubCallerContext context)
        {
            return players.FirstOrDefault(p => p.ConnectionId == context.ConnectionId);
        }
        
        private async void Tick(object state)
        {
            ++CurrentTick;
            if (CurrentTick <= 0)
            {
                await PlayingClients.SetCountdown(-CurrentTick + 1);
            }
            else if (CurrentTick <= TicksPerAltar)
            {
                await PlayingClients.Tick(players, CurrentTick);

                foreach (var p in players)
                {
                    p.Action = null;
                }
            }

            if (CurrentTick >= TicksPerAltar)
            {
                // Game is over
                await StopGame(false);
            }
        }

        private void StartGameIfReady()
        {
            var nonWatching = players.Where(p => !p.IsWatching).ToList();
            if (nonWatching.Count > 0 && nonWatching.All(p => p.IsReady))
            {
                timer.Change(0, TickLength);
                IsGameRunning = true;
            }
        }

        private async Task StopGame(bool callClientStop = true)
        {
            timer.Change(Timeout.Infinite, TickLength);
            CurrentTick = -CountdownLength;
            IsGameRunning = false;
            if (callClientStop)
            {
                await PlayingClients.Stop();
            }
        }

        private Task UpdatePlayerIndices()
        {
            return Task.WhenAll(Enumerable.Range(0, players.Count).Select(
                i => (Task)Clients.Client(players[i].ConnectionId).SendAsync("SetPlayerIndex", i)));
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

            [JsonProperty("isReady")]
            public bool IsReady { get; set; }

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
