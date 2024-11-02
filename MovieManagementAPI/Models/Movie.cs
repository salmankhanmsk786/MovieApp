namespace MovieManagementAPI.Models
{
    public class Movie
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty; // Default value
        public string Genre { get; set; } = string.Empty;
        public DateTime ReleaseDate { get; set; }
        public string Director { get; set; } = string.Empty;
        public List<Review>? Reviews { get; set; }
    }

}
