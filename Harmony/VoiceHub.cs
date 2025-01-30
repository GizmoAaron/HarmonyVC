using Microsoft.AspNetCore.SignalR;

namespace Harmony;

public class VoiceHub: Hub
{
    // Send the offer to the specified user
    public async Task SendOffer(string user, string offer)
    {
        await Clients.User(user).SendAsync("ReceiveOffer", Context.ConnectionId, offer);
        Console.WriteLine("Offering");
    }

    // Send the answer to the specified user
    public async Task SendAnswer(string user, string answer)
    {
        await Clients.User(user).SendAsync("ReceiveAnswer", Context.ConnectionId, answer);
        Console.WriteLine("Answering");
    }

    // Send the ICE candidate to the specified user
    public async Task SendIceCandidate(string user, string candidate)
    {
        await Clients.User(user).SendAsync("ReceiveIceCandidate", Context.ConnectionId, candidate);
        Console.WriteLine("IceCandidate");
    }

    // Handle when a user connects
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    // Handle when a user disconnects
    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}