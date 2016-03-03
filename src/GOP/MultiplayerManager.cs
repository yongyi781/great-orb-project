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
        private readonly Timer timer;
        private readonly object playersLock = new object();
        private const int CountdownTime = 5;
        private const string WaitlistGroup = "Waitlist";

        private readonly List<Player> players = new List<Player>();

        public MultiplayerManager()
        {
            timer = new Timer(Tick, null, Timeout.Infinite, 600);
        }

        [FromServices]
        public IHubContext<MultiplayerHub> HubContext { get; set; }

        public IHubConnectionContext<dynamic> Clients { get { return HubContext.Clients; } }
        public IGroupManager Groups { get { return HubContext.Groups; } }

        public bool IsGameRunning { get; set; }
        public bool HasSaved { get; set; }
        public int CurrentTick { get; set; } = -CountdownTime;
        public int Altar { get; set; } = 1;
        public int Seed { get; set; } = 5489;

        public void AddPlayer(HubCallerContext context)
        {
            var httpContext = context.Request.HttpContext;
            if (IsGameRunning)
            {
                Clients.Client(context.ConnectionId).RejectPlayer(players);
                Groups.Add(context.ConnectionId, WaitlistGroup);
            }
            else
            {
                Groups.Remove(context.ConnectionId, WaitlistGroup);
                lock (playersLock)
                {
                    players.Add(new Player
                    {
                        ConnectionId = context.ConnectionId,
                        IpAddress = httpContext.Connection.RemoteIpAddress.ToString(),
                        Username = "Change me",
                        Run = true,
                        IsWatching = true
                    });
                }
                Clients.Client(context.ConnectionId).SetGameParams(new { altar = Altar, seed = Seed });
                Clients.All.UpdatePlayers(players, true);
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
                    Clients.All.RemovePlayer(playerIndex);
                    for (int i = 0; i < players.Count; ++i)
                    {
                        Clients.Client(players[i].ConnectionId).SetPlayerIndex(i);
                    }
                }
                if (players.Count(p => !p.IsWatching) == 0)
                    StopGame(true);
            }
        }

        public void SendStartSignal(HubCallerContext context)
        {
            var player = GetPlayer(context);
            if (player != null)
                player.Started = true;
            if (players.Where(p => !p.IsWatching).All(p => p.Started))
            {
                timer.Change(0, 600);
                Clients.All.Start();
                IsGameRunning = true;
            }
            Clients.All.UpdatePlayers(players, false);
        }

        public void SendStopSignal(HubCallerContext context, bool stopClients = true)
        {
            if (IsGameRunning && !GetPlayer(context).IsWatching)
            {
                StopGame(stopClients);
                if (stopClients)
                {
                    foreach (var player in players)
                    {
                        player.Started = false;
                    }
                    Clients.All.Stop();
                    Clients.All.UpdatePlayers(players, false);
                }
                else
                {
                    // Game is still "running"
                    Clients.All.GameEnded();
                }
            }
            else
            {
                var player = GetPlayer(context);
                if (player != null)
                    player.Started = false;
                Clients.All.UpdatePlayers(players, false);
            }
        }

        public void SendAction(HubCallerContext context, string action)
        {
            var player = GetPlayer(context);
            if (player != null && !(player.IsWatching && IsAttractOrbAction(action)))
                player.Action = action;
            Clients.All.UpdatePlayers(players, false);
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
            var index = players.FindIndex(p => p.ConnectionId == context.ConnectionId);
            if (index != -1)
                Clients.All.SetPlayerStartLocation(index, x, y);
        }

        public void SetGameParams(HubCallerContext context, int altar, int seed)
        {
            Altar = altar;
            Seed = seed;
            Clients.All.SetGameParams(new { altar, seed });
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
            Clients.All.UpdatePlayers(players, false);
        }

        // The code has already been filtered for non-watching players.
        public void SendSaveRequest(HubCallerContext context, string code, int score)
        {
            if (!HasSaved)
            {
                HasSaved = true;

                // Prepare list of players
                var filteredPlayerNames = from player in players
                                          where !player.IsWatching
                                          select player.Username;

                // Save the game
                //using (var db = new GOPEntities())
                //{
                //    var game = new MultiplayerGame
                //    {
                //        Time = DateTime.Now,
                //        NumberOfPlayers = filteredPlayerNames.Count(),
                //        Usernames = string.Join("; ", filteredPlayerNames),
                //        NumberOfOrbs = 3,
                //        Seed = Seed,
                //        Altar = Altar,
                //        Score = score,
                //        Code = code
                //    };
                //    db.MultiplayerGames.Add(game);
                //    db.SaveChanges();

                //    Clients.All.NotifySaved(new
                //    {
                //        id = game.Id,
                //        time = game.Timestamp.ToString(),
                //        numberOfPlayers = game.NumberOfPlayers,
                //        usernames = game.Usernames,
                //        seed = game.Seed,
                //        altar = game.Altar,
                //        score = game.Score,
                //        code = game.Code
                //    });
                //}
            }
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
                Clients.Clients(players.Select(p => p.ConnectionId).ToList()).Countdown(CurrentTick);
            }
            else
            {
                Clients.Clients(players.Select(p => p.ConnectionId).ToList()).Tick(players);
                foreach (var p in players)
                {
                    p.Action = null;
                }
            }
        }

        private void StopGame(bool setGameRunningToFalse)
        {
            timer.Change(Timeout.Infinite, 600);
            CurrentTick = -CountdownTime;
            if (setGameRunningToFalse)
            {
                Clients.Group(WaitlistGroup).NotifyRejoin();
                IsGameRunning = false;
                HasSaved = false;
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

            [JsonProperty("started")]
            public bool Started { get; set; }

            [JsonProperty("action")]
            public string Action { get; set; }
            [JsonProperty("run")]
            public bool Run { get; set; }
            [JsonProperty("repel")]
            public bool Repel { get; set; }
            [JsonProperty("isWatching")]
            public bool IsWatching { get; set; }
        };
    }
}
