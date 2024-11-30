using System.ComponentModel.DataAnnotations;

namespace MovieManagementAPI.Models
{
    public class ApiForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }
}
