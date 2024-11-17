using System.ComponentModel.DataAnnotations;

namespace MovieManagementAPI.Models
{
    public class ApiRegisterRequest
    {
        public required string FirstName { get; set; } // Custom field
        public required string LastName { get; set; }  // Custom field
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
    }
}
