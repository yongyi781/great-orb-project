using GOP.Hubs;
using GOP.Models;
using GOP.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace GOP.Controllers
{
    [Route("api/[controller]")]
    public class ChatController : Controller
    {
        public ChatController(ApplicationDbContext dbContext,
            UserManager<ApplicationUser> userManager,
            IHubContext<ChatHub> chatHub,
            Random random,
            KickCounter kickCounter)
        {
            DbContext = dbContext;
            UserManager = userManager;
            ChatHub = chatHub;
            Random = random;
            KickCounter = kickCounter;
        }
        
        public ApplicationDbContext DbContext { get; set; }
        public UserManager<ApplicationUser> UserManager { get; set; }
        public IHubContext<ChatHub> ChatHub { get; set; }
        public Random Random { get; set; }
        public KickCounter KickCounter { get; set; }

        [HttpGet]
        public IEnumerable<ChatMessageView> Get(string search = null, int numMessages = 150)
        {
            if (numMessages > 2000)
                numMessages = 150;

            DbContext.CacheViewUsers = true;
            DbContext.LoadUsersIntoCache();
            IQueryable<ChatMessage> query = DbContext.ChatMessages.AsNoTracking();
            if (search != null)
            {
                if (search.StartsWith("user:"))
                {
                    search = search.Substring(5);
                    query = from message in query
                            where DbContext.GetUsername(new GopUser(message.UserId, message.IpAddress)).Contains(search)
                            select message;
                }
                else
                {
                    query = from message in query
                            where message.Text.Contains(search)
                            select message;
                }
            }

            // Get last 'numMessages' messages.
            query = query.OrderByDescending(m => m.Id).Take(numMessages).OrderBy(m => m.Id);
            var result = from m in query
                         select DbContext.GetChatMessageView(m);
            return result;
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var result = DbContext.ChatMessages.Where(m => m.Id == id).FirstOrDefault();
            if (result == null)
                return NotFound();
            return new ObjectResult(DbContext.GetChatMessageView(result));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Post(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return BadRequest("You entered an empty message.");
            message = message.TrimEnd();

            if (message[0] == '/' && message.Length > 1)
            {
                var command = message.Substring(1).Split(new char[] { ' ' }, 2, StringSplitOptions.RemoveEmptyEntries);
                if (command.Length >= 1)
                {
                    try
                    {
                        switch (command[0])
                        {
                            case "nick":
                                if (command.Length < 2)
                                    throw new InvalidOperationException("<b>Usage:</b> /nick &lt;new username&gt;");
                                SetNickname(command[1]);
                                break;
                            case "clearnick":
                                ClearNickname();
                                break;
                            case "edit":
                                if (command.Length < 2)
                                    throw new InvalidOperationException("<b>Usage:</b> /edit &lt;new message&gt;");
                                EditLastMessage(command[1]);
                                break;
                            case "editf":
                                if (command.Length < 2)
                                    throw new InvalidOperationException("<b>Usage:</b> /edit &lt;new message&gt;");
                                EditLastMessage(command[1], UserManager.GetUserIdInt32(User) == 1);
                                break;
                            case "del":
                                DeleteLastMessage();
                                break;
                            case "delf":
                                DeleteLastMessage(UserManager.GetUserIdInt32(User) == 1);
                                break;
                            case "rand":
                                lock (Random)
                                {
                                    var value = Random.Next();
                                    var username = DbContext.GetUsername(GopUser.GetCurrentUser(HttpContext));
                                    var randMessage = $"{username} has generated the random number {value}!";
                                    ChatHub.Clients.All.ShowMessage(randMessage);
                                    return Content(randMessage);
                                }
                            case "kick":
                                return Content($"The yellow orb was kicked {KickCounter.Kick()} times!");
                            case "refresh":
                                if (User.IsInRole("Administrators"))
                                {
                                    ChatHub.Clients.All.Refresh();
                                }
                                break;
                            case "su":
                                if (User.IsInRole("Administrators"))
                                {
                                    const string updatedMessage = "The server has updated! Please refresh this page.";
                                    ChatHub.Clients.All.ShowMessage(updatedMessage);
                                    return Content(updatedMessage);
                                }
                                break;
                            default:
                                throw new InvalidOperationException("Unrecognized command.");
                        }
                    }
                    catch (InvalidOperationException ex)
                    {
                        return BadRequest(ex.Message);
                    }
                }
            }
            else
            {
                var chatMessage = new ChatMessage
                {
                    IpAddress = HttpContext.Connection.RemoteIpAddress.ToString(),
                    Timestamp = DateTimeOffset.Now,
                    UserId = UserManager.GetUserIdInt32(User),
                    Text = message
                };

                DbContext.ChatMessages.Add(chatMessage);
                DbContext.SaveChanges();
                ChatHub.Clients.All.addMessage(DbContext.GetChatMessageView(chatMessage));
            }

            return new EmptyResult();
        }

        private void SetNickname(string desiredName)
        {
            if (Regex.IsMatch(desiredName, @"\$\$|[^A-zÀ-ÿ0-9 $\\{}^_-]") || desiredName.Count(c => c == '$') % 2 != 0)
                throw new InvalidOperationException("Invalid nickname.");
            if (desiredName.Length > 50)
                throw new InvalidOperationException("Nickname cannot be more than 50 characters long.");

            var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();
            var nick = DbContext.Nicknames.SingleOrDefault(e => e.IpAddress == ipAddress);
            if (nick != null)
            {
                nick.Name = desiredName;
                nick.LastChanged = DateTimeOffset.Now;
                DbContext.Nicknames.Update(nick);
            }
            else
            {
                DbContext.Nicknames.Add(new Nickname
                {
                    IpAddress = ipAddress,
                    Name = desiredName,
                    LastChanged = DateTimeOffset.Now
                });
            }
            DbContext.SaveChanges(true);

            var users = Hubs.ChatHub.UniqueOnlineUsers.Select(u => DbContext.GetChatUserOnlineView(u));
            ChatHub.Clients.All.UpdateOnlineUsers(users);
            ChatHub.Clients.All.UpdateMessages();
        }

        private void ClearNickname()
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();
            var nick = DbContext.Nicknames.SingleOrDefault(e => e.IpAddress == ipAddress);
            if (nick != null)
            {
                DbContext.Nicknames.Remove(nick);
                DbContext.SaveChanges();

                var users = Hubs.ChatHub.UniqueOnlineUsers.Select(u => DbContext.GetChatUserOnlineView(u));
                ChatHub.Clients.All.UpdateOnlineUsers(users);
                ChatHub.Clients.All.UpdateMessages();
            }
        }

        private void EditLastMessage(string newMessage, bool force = false)
        {
            var last = DbContext.ChatMessages.OrderByDescending(m => m.Id).FirstOrDefault();
            if (!force && !GopUser.GetCurrentUser(HttpContext).Equals(new GopUser(last.UserId, last.IpAddress)))
                throw new InvalidOperationException("The last message was written by someone else. You cannot edit someone else's message.");
            last.Text = newMessage;
            last.Timestamp = DateTimeOffset.Now;
            DbContext.SaveChanges();
            ChatHub.Clients.All.EditLastMessage(DbContext.GetChatMessageView(last));
        }

        private void DeleteLastMessage(bool force = false)
        {
            var last = DbContext.ChatMessages.OrderByDescending(m => m.Id).FirstOrDefault();
            if (last == null)
                throw new InvalidOperationException("There are no chat messages.");
            int lastId = last.Id;
            if (!force && !GopUser.GetCurrentUser(HttpContext).Equals(new GopUser(last.UserId, last.IpAddress)))
                throw new InvalidOperationException("The last message was written by someone else. You cannot delete someone else's message.");
            DbContext.ChatMessages.Remove(last);
            DbContext.SaveChanges();
            ChatHub.Clients.All.DeleteLastMessage(lastId);
        }
    }
}
