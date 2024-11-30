namespace MovieManagementAPI.Models
{
    public interface IAppEmailSender
    {
        Task SendEmailAsync(string email, string subject, string message);

    }
}
