using System;
using System.ComponentModel.DataAnnotations;

namespace BackendService.Models
{
    public class Bird
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string ScientificName { get; set; }

        [Required]
        [MaxLength(100)]
        public required string CommonName { get; set; }

        [MaxLength(100)]
        public string? Family { get; set; }

        [MaxLength(100)]
        public string? Order { get; set; }

        [MaxLength(50)]
        public string? ConservationStatus { get; set; }

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relacja z obserwacjami
        public ICollection<BirdObservation> Observations { get; set; } = new List<BirdObservation>();
    }
} 