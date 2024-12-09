using Microsoft.AspNetCore.Identity;
namespace MovieManagementAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FirstName { get; internal set; }
        public string? LastName { get; internal set; }
    }
}