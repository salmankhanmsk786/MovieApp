namespace MovieManagementAPI.Models
{
    public class ApiForgotPasswordResult
    {
        public bool Success { get; set; }
        public required string Message { get; set; }
    }
}
