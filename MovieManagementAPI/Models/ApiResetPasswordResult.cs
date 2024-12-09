
namespace MovieManagementAPI.Models
{
    public class ApiResetPasswordResult
    {
        public string Message { get; set; } = string.Empty; // Default to an empty string
        public bool Success { get; set; }
        public List<string>? Errors { get; internal set; }
    }
}
