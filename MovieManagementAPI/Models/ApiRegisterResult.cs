namespace MovieManagementAPI.Models
{
    public class ApiRegisterResult
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public string? Token { get; set; }

    }
}
