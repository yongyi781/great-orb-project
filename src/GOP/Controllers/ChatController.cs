using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using System.Security.Claims;
using GOP.Models;
using Microsoft.AspNet.SignalR;
using GOP.Hubs;
using Microsoft.Data.Entity.Query;
using System.Text.RegularExpressions;
using Microsoft.Data.Entity;

namespace GOP.Controllers
{
    [Route("api/[controller]")]
    public class ChatController : Controller
    {
        [FromServices]
        public ApplicationDbContext DbContext { get; set; }

        [FromServices]
        public IHubContext<ChatHub> ChatHub { get; set; }

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
                return HttpNotFound();
            return new ObjectResult(DbContext.GetChatMessageView(result));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Post(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return HttpBadRequest("You entered an empty message.");
            message = message.TrimEnd();

            if (message[0] == '/')
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
                                EditLastMessage(command[1], User.GetUserIdInt32() == 1);
                                break;
                            case "del":
                                DeleteLastMessage();
                                break;
                            case "delf":
                                DeleteLastMessage(User.GetUserIdInt32() == 1);
                                break;
                            case "rand":
                                return new ObjectResult(new Random().Next());
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
                        return HttpBadRequest(ex.Message);
                    }
                }
            }
            else
            {
                var chatMessage = new ChatMessage
                {
                    IpAddress = Context.Connection.RemoteIpAddress.ToString(),
                    Timestamp = DateTimeOffset.Now,
                    UserId = User.GetUserIdInt32(),
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
            if (Regex.IsMatch(desiredName, @"\$\$|[^a-zA-Z0-9 $\\{}^_-]") || desiredName.Count(c => c == '$') % 2 != 0)
                throw new InvalidOperationException("Invalid nickname.");
            if (desiredName.Length > 50)
                throw new InvalidOperationException("Nickname cannot be more than 50 characters long.");

            var ipAddress = Context.Connection.RemoteIpAddress.ToString();
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
            var ipAddress = Context.Connection.RemoteIpAddress.ToString();
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
            if (!force && !GopUser.GetCurrentUser(Context).Equals(new GopUser(last.UserId, last.IpAddress)))
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
            if (!force && !GopUser.GetCurrentUser(Context).Equals(new GopUser(last.UserId, last.IpAddress)))
                throw new InvalidOperationException("The last message was written by someone else. You cannot delete someone else's message.");
            DbContext.ChatMessages.Remove(last);
            DbContext.SaveChanges();
            ChatHub.Clients.All.DeleteLastMessage(lastId);
        }
    }
}
