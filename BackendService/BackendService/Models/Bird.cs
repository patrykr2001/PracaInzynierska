using System;
using System.ComponentModel.DataAnnotations;

namespace BackendService.Models
{
    public class Bird
    {
        public int Id { get; set; }

        [Required]
        public string CommonName { get; set; } = string.Empty;

        [Required]
        public string ScientificName { get; set; } = string.Empty;

        [Required]
        public string Family { get; set; } = string.Empty;

        public string? Order { get; set; }

        public string? Genus { get; set; }

        public string? Species { get; set; }

        [Required]
        public string ConservationStatus { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? Habitat { get; set; }

        public string? Diet { get; set; }

        public string? Size { get; set; }

        public double? Weight { get; set; }

        public double? Wingspan { get; set; }

        public string? Lifespan { get; set; }

        public string? BreedingSeason { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsVerified { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relacja z obserwacjami
        public ICollection<BirdObservation> Observations { get; set; } = new List<BirdObservation>();
    }
} 