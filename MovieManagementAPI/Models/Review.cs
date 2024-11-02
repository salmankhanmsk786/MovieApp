namespace MovieManagementAPI.Models
{
    public class Review
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public string ReviewerName { get; set; } = string.Empty; // Default value
        public string ReviewText { get; set; } = string.Empty;
        public int Rating { get; set; }
    }

}
