namespace MovieManagementAPI.Models
{
    public class Chats
    {
        public int Id { get; set; } // Primary key
        public required string SenderId { get; set; }
        public required string Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
