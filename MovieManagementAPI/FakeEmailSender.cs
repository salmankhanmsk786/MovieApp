using MovieManagementAPI.Models;

public class FakeEmailSender : IAppEmailSender
{
    public Task SendEmailAsync(string email, string subject, string message)
    {
        return Task.CompletedTask; // Do nothing
    }
}
