using System.Net.Mail;
using System.Net;

namespace MovieManagementAPI.Models
{
    public class EmailSender : IAppEmailSender
    {
        private readonly IConfiguration _configuration;

        public EmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            var smtpClient = new SmtpClient
            {
                Host = _configuration["EmailSender:Host"],
                Port = int.Parse(_configuration["EmailSender:Port"]),
                Credentials = new NetworkCredential(
                    _configuration["EmailSender:Username"],
                    _configuration["EmailSender:Password"]
                ),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_configuration["EmailSender:FromEmail"]),
                Subject = subject,
                Body = message,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(email);

            await smtpClient.SendMailAsync(mailMessage);
        }
    }

}
