using Microsoft.AspNetCore.Identity;

namespace BackendService.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Bird> Birds { get; set; } = new List<Bird>();
        public ICollection<BirdObservation> BirdObservations { get; set; } = new List<BirdObservation>();
    }
} 