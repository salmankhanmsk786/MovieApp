using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using MovieManagementAPI.Models;
using System.Collections.Concurrent;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly UserManager<ApplicationUser> _userManager;
    private static readonly ConcurrentDictionary<string, string> OnlineUsers = new ConcurrentDictionary<string, string>();

    public ChatHub(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null && user.UserName != null)
            {
                OnlineUsers.TryAdd(userId, user.UserName);
                await Clients.All.SendAsync("UserConnected", user.UserName);
                await Clients.All.SendAsync("UpdateOnlineUsers", OnlineUsers.Values);
            }
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            OnlineUsers.TryRemove(userId, out var userName);
            await Clients.All.SendAsync("UserDisconnected", userName);
            await Clients.All.SendAsync("UpdateOnlineUsers", OnlineUsers.Values);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string message)
    {
        var userId = Context.UserIdentifier;
        if (userId != null)
        {
            var sender = await _userManager.FindByIdAsync(userId);
            if (sender != null)
            {
                await Clients.All.SendAsync("ReceiveMessage", sender.UserName, message);
            }
        }
    }

    public async Task<List<string>> GetOnlineUsers()
    {
        return OnlineUsers.Values.ToList();
    }
}
