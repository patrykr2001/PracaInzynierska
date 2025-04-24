using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendService.Models
{
    public class BirdObservation
    {
        public int Id { get; set; }

        [Required]
        public int BirdId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [Column(TypeName = "decimal(9,6)")]
        public decimal Latitude { get; set; }

        [Required]
        [Column(TypeName = "decimal(9,6)")]
        public decimal Longitude { get; set; }

        [Required]
        public DateTime ObservationDate { get; set; }

        public string? Description { get; set; }

        public int? NumberOfBirds { get; set; }

        [MaxLength(100)]
        public string? WeatherConditions { get; set; }

        [MaxLength(100)]
        public string? Habitat { get; set; }

        public bool IsVerified { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relacje
        public required Bird Bird { get; set; }
        public required User User { get; set; }
    }
} 