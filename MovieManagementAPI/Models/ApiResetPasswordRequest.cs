using System.ComponentModel.DataAnnotations;

namespace MovieManagementAPI.Models
{
    public class ApiResetPasswordRequest
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string Token { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        public required string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public required string ConfirmNewPassword { get; set; }
    }
}
